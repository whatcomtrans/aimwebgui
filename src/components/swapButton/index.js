import React from "react";
import { Arrow } from "../icons";

const SwapButton = ({ className, swapChannels }) => (
  <div className={className} onClick={swapChannels}>
    <Arrow />
  </div>
);

export default SwapButton;
