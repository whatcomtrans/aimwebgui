import React from "react";
import { Monitor } from "../icons";

const MonitorSet = ({ receiver, openChannelsModal }) => (
  <div
    onClick={() => {
      openChannelsModal(receiver);
    }}
  >
    <Monitor />
    <Monitor />
    <div>{receiver && receiver.channelDescription}</div>
  </div>
);

export default MonitorSet;
