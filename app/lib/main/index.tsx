import * as React from "react";
import firebase from "../firebase/firebase-init";
import { initialize } from "../analytics";
import "../app.css";

// UI COMPS
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import { eventkeys } from "../constants";
import { ReleaseChannel } from "../states/app-state";
import { PluginApp } from "../utils/plugin-provider/pugin-app";
import BatchMetaEditor from "../screens/tool-box/batch-meta-editor";
import { Switch, Route, Link, BrowserRouter, Redirect } from "react-router-dom";

// region screens import
import { FontReplacerScreen } from "../screens/tool-box/font-replacer";
import { ButtonMakerScreen } from "../screens/design/button-maker-screen";
import ComponentViewScreen from "../screens/component-view";
import LayoutViewScreen from "../screens/layout-view";
import { LintScreen } from "../screens/lint-screen";
import { GlobalizationScreen } from "../screens/g11n-screen";
import { IconsScreen } from "../screens/icons-screen";
import { CodeScreen } from "../screens/code-screen";
import { ToolboxScreen } from "../screens/tool-box/dev-tools";
import { MetaEditorScreen } from "../screens/tool-box/meta-editor";
import { ExporterScreen } from "../screens/tool-box/exporter";
import { WorkspaceMode, WorkScreen, workScreenToName } from "./screens";
import { ComponentizerScreen } from "../screens/tool-box/componentizer";

// endregion screens import

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`app-tab-${index}`}
      // aria-labelledby={`tab-${type}`}
      {...other}
    >
      {value === index && <>{props.children}</>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `app-tab-${index}`,
    // 'aria-controls': `tab-${mode}`,
  };
}

function worspaceModeToName(workspaceMode: WorkspaceMode): string {
  switch (workspaceMode) {
    case WorkspaceMode.code:
      return "CODE";
    case WorkspaceMode.design:
      return "DESIGN";
    case WorkspaceMode.content:
      return "CONTENT";
    case WorkspaceMode.settings:
      return "SETTINGS";
    case WorkspaceMode.toolbox:
      return "TOOLS";
  }
  console.warn(`no name found for workspace mode ${workspaceMode}`);
  return "N/A";
}

const SCREEN_VISIBILITY_PREFERENCE: Map<WorkScreen, ReleaseChannel> = new Map([
  [WorkScreen.code, "release"],
  [WorkScreen.component, "release"],
  [WorkScreen.layout, "beta"],
  [WorkScreen.icon, "release"],
  [WorkScreen.lint, "release"],
  [WorkScreen.g11n, "beta"],
  [WorkScreen.exporter, "beta"],
  [WorkScreen.dev, "beta"],
  [WorkScreen.slot, "alpha"],
  [WorkScreen.desing_button_maker, "alpha"],
  [WorkScreen.tool_font_replacer, "release"],
]);

type TabLayout = ReadonlyArray<WorkScreen>;

function getWorkspaceTabLayout(workspaceMode: WorkspaceMode): TabLayout {
  const layouts = (): TabLayout => {
    switch (workspaceMode) {
      case WorkspaceMode.code:
        return [
          WorkScreen.code,
          WorkScreen.component,
          WorkScreen.layout,
          WorkScreen.lint,
          WorkScreen.slot,
        ];
      case WorkspaceMode.design:
        return [WorkScreen.icon, WorkScreen.layout, WorkScreen.lint];
      case WorkspaceMode.content:
        return [WorkScreen.g11n, WorkScreen.lint, WorkScreen.exporter];
      case WorkspaceMode.settings:
        return [];
      case WorkspaceMode.toolbox:
        return [
          WorkScreen.tool_font_replacer,
          WorkScreen.desing_button_maker,
          WorkScreen.tool_meta_editor,
          WorkScreen.tool_batch_meta_editor,
          WorkScreen.tool_componentizer,
        ];
    }
  };

  // this only returns release capable screens on production mode, if not -> reutns all.
  const filtered = layouts().filter((e) => {
    const release = process.env.NODE_ENV == "production";
    if (release) {
      if (SCREEN_VISIBILITY_PREFERENCE.get(e) === "release") {
        return true;
      } else {
        return false;
      }
    }
    return true;
  });
  return filtered;
}

export default function App() {
  // region init firebase
  try {
    firebase.analytics();
  } catch (e) {
    console.warn(
      "firebase is disabled. it seems you are contributing to this project!, no worries, other functionalyties will work fine."
    );
  }
  // endregion init firebase

  // region init GA
  try {
    initialize();
  } catch (e) {
    console.warn("GA disabled", e);
  }
  // endregion init GA

  const [workspaceMode, setWorkspaceMode] = React.useState<WorkspaceMode>(
    WorkspaceMode.code
  );
  const [tabIndex, setTabIndex] = React.useState<number>(0);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOpenWorkspaceModeChangeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleWorkspaceModeSelect = (e) => {
    setAnchorEl(null);

    console.log(
      "workspace mode menu clicked e:",
      e.target.value as WorkspaceMode
    );
    let selected: WorkspaceMode = e.target.value;
    console.log("newly selected workspace mode is:", selected);

    // when outside of menu is clicked, value is undefined -- so as the selected will be.
    if (selected === undefined) {
      selected = workspaceMode;
    }

    setWorkspaceMode(selected);

    // when workspace mode is updated, by default the first index 0 tab will be selected without select event.
    // explicitly triggering the event.
    const newTabLayout = getWorkspaceTabLayout(selected);
    updateFocusedScreen(newTabLayout[0]);
  };

  const updateFocusedScreen = (screen: WorkScreen) => {
    // notify code.ts that app mode has set.
    parent.postMessage(
      {
        pluginMessage: {
          type: eventkeys.EK_SET_APP_MODE,
          data: screen,
        },
      },
      "*"
    );
  };

  function makeTabLayout(workspaceMode: WorkspaceMode) {
    const tabLayout = getWorkspaceTabLayout(workspaceMode);
    const handleTabChange = (event, index: number) => {
      const screen = tabLayout[index];
      updateFocusedScreen(screen);
      setTabIndex(index);
    };

    const tabs = (
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="primary tab"
      >
        {tabLayout.map((v, i) => {
          return (
            <Tab
              key={v}
              label={workScreenToName(v)}
              {...a11yProps(i)}
              style={{ textTransform: "capitalize" }}
            />
          );
        })}
      </Tabs>
    );

    const panels = (
      <>
        {tabLayout.map((v, i) => {
          switch (v) {
            case WorkScreen.code:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <CodeScreen />
                </TabPanel>
              );
            case WorkScreen.component:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <ComponentViewScreen />
                </TabPanel>
              );
            case WorkScreen.layout:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <LayoutViewScreen />
                </TabPanel>
              );
            case WorkScreen.icon:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <IconsScreen />
                </TabPanel>
              );
            case WorkScreen.lint:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <LintScreen />
                </TabPanel>
              );
            case WorkScreen.dev:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <ToolboxScreen />
                </TabPanel>
              );
            case WorkScreen.g11n:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <GlobalizationScreen />
                </TabPanel>
              );
            case WorkScreen.exporter:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <ExporterScreen />
                </TabPanel>
              );
            case WorkScreen.tool_font_replacer:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <FontReplacerScreen />
                </TabPanel>
              );
            case WorkScreen.tool_meta_editor:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <MetaEditorScreen />
                </TabPanel>
              );
            case WorkScreen.tool_batch_meta_editor:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <BatchMetaEditor />
                </TabPanel>
              );
            case WorkScreen.desing_button_maker:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <ButtonMakerScreen />
                </TabPanel>
              );
            case WorkScreen.tool_componentizer:
              return (
                <TabPanel key={i} value={tabIndex} index={i}>
                  <ComponentizerScreen />
                </TabPanel>
              );
            default:
              console.warn(
                `screen: ${v} has no corresponding screen to be loaded`
              );
          }
        })}
      </>
    );

    return (
      <div className="outer-ui">
        <div className="tabs-wrapper" style={{ margin: "0 -8px" }}>
          {tabs}
        </div>

        {panels}
      </div>
    );
  }

  function makeWorkspaceModeSelect() {
    return (
      <div>
        <Button
          endIcon={<KeyboardArrowDown />}
          aria-controls="workspace-mode"
          aria-haspopup="true"
          onClick={handleOpenWorkspaceModeChangeClick}
        >
          {worspaceModeToName(workspaceMode)}
        </Button>
        <Menu
          id="workspace-mode"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleWorkspaceModeSelect}
          style={{ fontWeight: "bold" }}
        >
          <MenuItem
            onClick={handleWorkspaceModeSelect}
            value={WorkspaceMode.code}
          >
            CODE
          </MenuItem>
          <MenuItem
            onClick={handleWorkspaceModeSelect}
            value={WorkspaceMode.design}
          >
            DESIGN
          </MenuItem>
          <MenuItem
            onClick={handleWorkspaceModeSelect}
            value={WorkspaceMode.content}
          >
            CONTENT
          </MenuItem>
          <MenuItem
            onClick={handleWorkspaceModeSelect}
            value={WorkspaceMode.toolbox}
          >
            TOOLS
          </MenuItem>
        </Menu>
      </div>
    );
  }

  const screenLayout = makeTabLayout(workspaceMode);
  const workspaceModeSelectLayout = makeWorkspaceModeSelect();

  return (
    <PluginApp>
      <BrowserRouter>
        {workspaceModeSelectLayout}
        {screenLayout}
      </BrowserRouter>
    </PluginApp>
  );
}
