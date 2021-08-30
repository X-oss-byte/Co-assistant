import React, { useEffect, useState } from "react";
import { ASSISTANT_PLUGIN_NAMESPACE__NOCHANGE } from "@core/constant";
import { useSingleSelection } from "plugin-app";
import { PluginSdk } from "@plugin-sdk/app";
import { SingleLayerPropertyDefinition } from "./single-property";
import { ISingleLayerProperty, IProperties } from "./types";
import { nodes, utils } from "@design-sdk/core";
import { variant } from "@design-sdk/figma/features";
import { _FigmaVariantPropertyCompatType_to_string } from "../design-sdk/figma/features/variant";

const ERROR_MESSAGES = {
  nothing_is_selected: "Nothing is selected",
  you_must_select_instance_or_component_type_of_node:
    "You must select instance or component type of node.",
};

type ComponentLikeType =  // component set frame
  | "master-variant-set"
  // componennt with/without variant compat (can be used for both, but use it only for non variant component)
  | "master-component"
  // instance of simple or varianted component
  | "instance";

type SchemaDefinitionLike =
  | ComponentLikeType
  // single layer - no matter where it lives under a componennt or a raw group, etc.
  | "single-layer-property";

type EditerMode =
  | SchemaDefinitionLike
  // non is set, loading state
  | "no-selection";

function analyzeSelection(node): SchemaDefinitionLike {
  if (
    node?.origin != nodes.ReflectSceneNodeType.component &&
    node?.origin != nodes.ReflectSceneNodeType.variant_set &&
    node?.origin != nodes.ReflectSceneNodeType.instance
  ) {
    return "single-layer-property";
  } else if (node?.origin == nodes.ReflectSceneNodeType.component) {
    return "master-component";
  } else if (node?.origin == nodes.ReflectSceneNodeType.variant_set) {
    return "master-variant-set";
  } else if (node?.origin == nodes.ReflectSceneNodeType.instance) {
    return "instance";
  }
}

export function SchemaEditor(props: {}) {
  const [mode, setMode] = useState<EditerMode>("no-selection");

  // use selection hook, then update the mode corresponding to selected layer on design tool

  const selection = useSingleSelection();

  useEffect(() => {
    if (selection) {
      const analysis = analyzeSelection(selection?.node);
      setMode(analysis);
    } else {
      setMode("no-selection");
    }
  }, [selection]);

  const Body = () => {
    if (!selection) {
      // Empty state
      return <_Mode_Empty />;
    }
    switch (mode) {
      case "no-selection":
        return <_Mode_NoSelection />;
      case "single-layer-property":
        return <_Mode_SingleLayerProperty node={selection.node} />;
      case "master-variant-set":
        return <_Mode_Variant_Set />;
      case "master-component":
        return <_Mode_Component node={selection.node} />;
      case "instance":
        return <_Mode_Instance node={selection.node} />;
      default:
        throw `${mode} not handled`;
    }
  };

  return (
    <>
      <p>schema editor</p>
      <p>{selection?.node?.origin}</p>
      <Body />
    </>
  );
}

function _Mode_Empty() {
  return <>Nothing is selected</>;
}

function _Mode_NoSelection() {
  return <>nothing selected</>;
}

function _Mode_SingleLayerProperty(props: {
  node: nodes.light.IReflectNodeReference;
}) {
  const { node } = props;
  const id = node.id;

  const [data, setData] = useState<IProperties>([]);
  const handleOnSave = (d: ISingleLayerProperty) => {
    const newData = data;
    newData.push(d);
    setData(newData);

    // this update logic shall be applied to master node's corresponding layer
    PluginSdk.updateMetadata({
      id: id,
      namespace: ASSISTANT_PLUGIN_NAMESPACE__NOCHANGE,
      key: "layer-property-data",
      value: data,
    });
  };

  useEffect(() => {
    PluginSdk.fetchMetadata({
      id: id,
      namespace: ASSISTANT_PLUGIN_NAMESPACE__NOCHANGE,
      key: "layer-property-data",
    }).then((d) => {
      if (d) {
        setData(d);
      }
    });
  }, []);

  return (
    <>
      {data.length > 0 ? (
        data.map((d) => (
          <SingleLayerPropertyDefinition
            key={d?.schema.name}
            onSave={handleOnSave}
            initial={d}
          />
        ))
      ) : (
        //   automatically preset a new property
        <SingleLayerPropertyDefinition
          key={"new"}
          initialMode={"editing"}
          onSave={handleOnSave}
          initial={{
            schema: {
              name: `${node.name}`,
              type: "string",
            },
            targetProperty: undefined,
            locateMode: "auto",
          }}
        />
      )}
    </>
  );
}

function _Mode_Variant_Set(props: {
  node?: nodes.light.IReflectNodeReference;
  defaultComponent?: nodes.light.IReflectNodeReference;
}) {
  // TODO
  return <p>select component inside variant set</p>;
}

function _Mode_Component(props: { node: nodes.light.IReflectNodeReference }) {
  const { node } = props;
  const [properties, setProperties] = useState<ISingleLayerProperty[]>(null);

  // 0. check if variant compat component (if it's parent is variant-set then it is.)
  const isVariantCompat =
    node.parentReference.origin == nodes.ReflectSceneNodeType.variant_set;

  // if variant, load default property set by variant namings.
  let variantProperties: variant.VariantProperty[];
  if (isVariantCompat) {
    const names = variant.getVariantNamesSetFromReference_Figma(node);
    variantProperties = variant.extractTypeFromVariantNames_Figma(names);
  }

  //1. list all layers under this component
  const grandchilds = utils.mapGrandchildren(node);

  //2. extract schema from layers
  useEffect(() => {
    Promise.all(
      grandchilds.map((c) => {
        return PluginSdk.fetchMetadata_grida<ISingleLayerProperty>(
          c.id,
          "layer-property-data"
        );
      })
    ).then((res) => {
      const layersWithPropertyData = res.filter((i) => i !== undefined);
      setProperties(layersWithPropertyData);
    });
  }, []);

  //3. display available layer schema as this component's property

  return (
    <>
      <h6>Properties</h6>
      {/*  */}
      {variantProperties ? (
        <>
          <h6>variant properties</h6>
          <ul>
            {variantProperties.map((n) => {
              return (
                <li>
                  name:{n.key}, type:
                  {`${_FigmaVariantPropertyCompatType_to_string(n.type)}`}
                </li>
              );
            })}
          </ul>
          <h6>data</h6>
        </>
      ) : (
        <></>
      )}
      {/*  */}
      {properties ? (
        <ul>
          {properties.map((p) => {
            return <li>{JSON.stringify(p)}</li>;
          })}
        </ul>
      ) : (
        <>Loading..</>
      )}
    </>
  );
}

function _Mode_Instance(props: { node: nodes.light.IReflectNodeReference }) {
  return <></>;
}