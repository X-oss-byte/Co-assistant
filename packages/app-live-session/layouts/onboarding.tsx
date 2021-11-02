import React from "react";
import styled from "@emotion/styled";
import { RevealWhenVisible } from "app/lib/components/animated";
import { BlackButtonStyle } from "@ui/core/button-style";

export function OnboardingLayout() {
  return (
    <RootWrapperBody>
      <InnderContent>
        <RevealWhenVisible initialOpacity={0} initialY={10}>
          <GraphicsAndDescription>
            <ArtworkAppGroupedFigmaGridaVscodeArtwork
              src={"/assets/images/artwork-app-grouped-figma-grida-vscode.png"}
              alt="image of ArtworkAppGroupedFigmaGridaVscodeArtwork"
            ></ArtworkAppGroupedFigmaGridaVscodeArtwork>
            <CheckYourInternetConnectionAndTryAgainIfThisKeepContinuesToHappenTellUs>
              Setup for Assistant Live session and integrate your design
              directly on VSCode and more.
            </CheckYourInternetConnectionAndTryAgainIfThisKeepContinuesToHappenTellUs>
          </GraphicsAndDescription>
        </RevealWhenVisible>
        <div style={{ alignSelf: "stretch" }}>
          <RevealWhenVisible initialOpacity={0} initialY={10}>
            <MainButton>Setup now</MainButton>
          </RevealWhenVisible>
        </div>
      </InnderContent>
    </RootWrapperBody>
  );
}

const RootWrapperBody = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: start;
  box-sizing: border-box;
  padding: 90px 21px 21px;
`;

const InnderContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 206px;
  align-self: stretch;
  box-sizing: border-box;
`;

const GraphicsAndDescription = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  flex: none;
  gap: 34px;
  height: 320px;
  box-sizing: border-box;
`;

const ArtworkAppGroupedFigmaGridaVscodeArtwork = styled.img`
  width: 294px;
  height: 232px;
  object-fit: cover;
`;

const CheckYourInternetConnectionAndTryAgainIfThisKeepContinuesToHappenTellUs = styled.span`
  color: rgba(149, 149, 149, 1);
  text-overflow: ellipsis;
  font-size: 16px;
  font-family: Helvetica, sans-serif;
  font-weight: 400;
  text-align: center;
  width: 269px;
`;

const MainButton = styled.button`
  ${BlackButtonStyle}
  width: 100%;
`;
