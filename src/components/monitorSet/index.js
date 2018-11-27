import React from "react";
import { Monitor } from "../icons";

const MonitorSet = ({
  receiver,
  openChannelsModal,
  monitorWidth,
  monitorHeight,
}) => (
  <div
    onClick={() => {
      openChannelsModal(receiver);
    }}
  >
    <Monitor width={monitorWidth} height={monitorHeight} />
    <Monitor width={monitorWidth} height={monitorHeight} />
    <div>{receiver && receiver.channelDescription}</div>
  </div>
);

export default MonitorSet;
