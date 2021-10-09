import React from "react";
import styled from "@emotion/styled";

export function MoreHoriz() {
  return (
    <IconWrap>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM2.33337 7.00004C2.33337 6.35837 2.85837 5.83337 3.50004 5.83337C4.14171 5.83337 4.66671 6.35837 4.66671 7.00004C4.66671 7.64171 4.14171 8.16671 3.50004 8.16671C2.85837 8.16671 2.33337 7.64171 2.33337 7.00004ZM9.33337 7.00004C9.33337 6.35837 9.85837 5.83337 10.5 5.83337C11.1417 5.83337 11.6667 6.35837 11.6667 7.00004C11.6667 7.64171 11.1417 8.16671 10.5 8.16671C9.85837 8.16671 9.33337 7.64171 9.33337 7.00004ZM5.83337 7.00004C5.83337 6.35837 6.35837 5.83337 7.00004 5.83337C7.64171 5.83337 8.16671 6.35837 8.16671 7.00004C8.16671 7.64171 7.64171 8.16671 7.00004 8.16671C6.35837 8.16671 5.83337 7.64171 5.83337 7.00004Z"
          fill="#6B6C6C"
        />
      </svg>
    </IconWrap>
  );
}

const IconWrap = styled.span`
  cursor: pointer;
`;
