import React, { Component } from "react";
import { ChannelsModal, PresetsModal } from "./components/modal";
import MonitorSet from "./components/monitorSet";
import SwapButton from "./components/swapButton";
import LoadingSpinner from "./components/loadingSpinner";
import {
  login,
  getChannels,
  getDevices,
  getPresets,
  connectChannel,
  connectPreset,
} from "./aimApiClient";
import styles from "./styles.scss";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receiverOne: null,
      receiverTwo: null,
      receiverThree: null,
      isChannelsModalOpen: false,
      modalReceiver: null,
      isPresetsModalOpen: false,
      isLoading: false,
      error: null,
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: true });
    const queryString = new URLSearchParams(window.location.search);
    const { error: loginError } = await login(queryString.get("id"), "");

    if (loginError) {
      this.setState({
        isLoading: false,
        error: { context: "componentDidMount.login", message: loginError },
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    const { channels, error: getChannelsError } = await getChannels();
    const { presets, error: getPresetsError } = await getPresets();

    if (getDevicesError || getChannelsError || getPresetsError) {
      this.setState({
        isLoading: false,
        error: {
          context: "componentDidMount.getDevices|getChannels|getPresets",
          message: getDevicesError || getChannelsError || getPresetsError,
        },
      });
      return;
    }

    const { receiverOne, receiverTwo, receiverThree } = this.mapReceivers(
      devices,
      channels
    );

    this.setState({
      devices,
      channels,
      presets,
      receiverOne,
      receiverTwo,
      receiverThree,
      isLoading: false,
    });
  }

  openChannelsModal = receiver => {
    this.setState({
      isChannelsModalOpen: true,
      modalReceiver: receiver,
    });
  };

  closeChannelsModal = () => {
    this.setState({ isChannelsModalOpen: false, modalReceiver: null });
  };

  openPresetsModal = () => {
    this.setState({ isPresetsModalOpen: true });
  };

  closePresetsModal = () => {
    this.setState({ isPresetsModalOpen: false });
  };

  mapReceivers = (devices, channels) => {
    const deviceOne = devices[0];
    const deviceTwo = devices[1];
    const deviceThree = devices[2];
    let receiverOne;
    let receiverTwo;
    let receiverThree;

    if (deviceOne) {
      const deviceChannel = channels.find(
        channel => deviceOne.c_name === channel.c_name
      );

      receiverOne = {
        deviceId: deviceOne.d_id,
        deviceName: deviceOne.d_name,
        channelId: deviceChannel.c_id,
        channelName: deviceOne.c_name,
        channelDescription: deviceChannel.c_description,
      };
    }

    if (deviceTwo) {
      const deviceChannel = channels.find(
        channel => deviceTwo.c_name === channel.c_name
      );

      receiverTwo = {
        deviceId: deviceTwo.d_id,
        deviceName: deviceTwo.d_name,
        channelId: deviceChannel.c_id,
        channelName: deviceTwo.c_name,
        channelDescription: deviceChannel.c_description,
      };
    }

    if (deviceThree) {
      const deviceChannel = channels.find(
        channel => deviceThree.c_name === channel.c_name
      );

      receiverThree = {
        deviceId: deviceThree.d_id,
        deviceName: deviceThree.d_name,
        channelId: deviceChannel.c_id,
        channelName: deviceThree.c_name,
        channelDescription: deviceChannel.c_description,
      };
    }

    return { receiverOne, receiverTwo, receiverThree };
  };

  selectChannel = async (channelId, deviceId) => {
    this.setState({ isLoading: true, isChannelsModalOpen: false });
    const response = await connectChannel(channelId, deviceId);
    if (response && response.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "selectChannel.connectChannel",
          message: response.error,
        },
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    if (getDevicesError) {
      this.setState({
        isLoading: false,
        error: {
          context: "selectChannel.getDevices",
          message: getDevicesError,
        },
      });
      return;
    }

    const { channels } = this.state;
    const { receiverOne, receiverTwo, receiverThree } = this.mapReceivers(
      devices,
      channels
    );

    this.setState({
      devices,
      receiverOne,
      receiverTwo,
      receiverThree,
      isLoading: false,
    });
  };

  swapChannels = async (
    { channelId: channelAId, deviceId: deviceAId },
    { channelId: channelBId, deviceId: deviceBId }
  ) => {
    this.setState({ isLoading: true });
    const responseA = await connectChannel(channelAId, deviceBId);
    if (responseA && responseA.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "swapChannels.connectChannelA",
          message: responseA.error,
        },
      });
      return;
    }

    const responseB = await connectChannel(channelBId, deviceAId);
    if (responseB && responseB.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "swapChannels.connectChannelB",
          message: responseB.error,
        },
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    if (getDevicesError) {
      this.setState({
        isLoading: false,
        error: { context: "swapChannels.getDevices", message: getDevicesError },
      });
      return;
    }

    const { channels } = this.state;
    const { receiverOne, receiverTwo, receiverThree } = this.mapReceivers(
      devices,
      channels
    );

    this.setState({
      receiverOne,
      receiverTwo,
      receiverThree,
      isLoading: false,
    });
  };

  selectPreset = async presetId => {
    this.setState({ isLoading: true, isPresetsModalOpen: false });
    const response = await connectPreset(presetId);

    if (response && response.error) {
      this.setState({
        isLoading: false,
        error: {
          context: "selectPreset.connectPreset",
          message: response.error,
        },
      });
      return;
    }

    const { devices, error: getDevicesError } = await getDevices();
    if (getDevicesError) {
      this.setState({
        isLoading: false,
        error: { context: "selectPreset.getDevices", message: getDevicesError },
      });
      return;
    }

    const { channels } = this.state;
    const { receiverOne, receiverTwo, receiverThree } = this.mapReceivers(
      devices,
      channels
    );

    this.setState({
      receiverOne,
      receiverTwo,
      receiverThree,
      isLoading: false,
    });
  };

  refresh = () => {
    window.location.reload();
  };

  render() {
    const {
      receiverOne,
      receiverTwo,
      receiverThree,
      channels,
      devices,
      presets,
      isChannelsModalOpen,
      modalReceiver,
      isPresetsModalOpen,
      isLoading,
      error,
    } = this.state;

    if (error) {
      return (
        <div className={styles.error}>
          <div>Context: {error.context}</div>
          <div>Error: {error.message}</div>
          <button className={styles.refreshButton} onClick={this.refresh}>
            Refresh
          </button>
        </div>
      );
    }

    if (!channels && !devices && !presets) {
      return (
        <div className={styles.loadingSpinner}>
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <div className={styles.app}>
        <div className={styles.container}>
          <button
            className={styles.layoutPresetsButton}
            onClick={this.openPresetsModal}
          >
            Layout Presets
          </button>
          <div className={styles.topRow}>
            <MonitorSet
              receiver={receiverThree}
              openChannelsModal={this.openChannelsModal}
            />
          </div>
          <div className={styles.middleRow}>
            <SwapButton
              className={styles.swapTopLeft}
              swapChannels={() => {
                this.swapChannels(receiverOne, receiverThree);
              }}
            />
            <div className={styles.spacer} />
            <SwapButton
              className={styles.swapRightTop}
              swapChannels={() => {
                this.swapChannels(receiverTwo, receiverThree);
              }}
            />
          </div>
          <div className={styles.bottomRow}>
            <div className={styles.left}>
              <MonitorSet
                receiver={receiverOne}
                openChannelsModal={this.openChannelsModal}
              />
            </div>
            <SwapButton
              className={styles.swapLeftRight}
              swapChannels={() => {
                this.swapChannels(receiverOne, receiverTwo);
              }}
            />
            <div className={styles.right}>
              <MonitorSet
                receiver={receiverTwo}
                openChannelsModal={this.openChannelsModal}
              />
            </div>
          </div>
        </div>
        <ChannelsModal
          isOpen={isChannelsModalOpen}
          channels={channels}
          closeModal={this.closeChannelsModal}
          receiver={modalReceiver}
          selectChannel={this.selectChannel}
        />
        <PresetsModal
          isOpen={isPresetsModalOpen}
          presets={presets}
          closeModal={this.closePresetsModal}
          selectPreset={this.selectPreset}
        />
        {isLoading ? (
          <div className={styles.loadingSpinner}>
            <LoadingSpinner />
          </div>
        ) : null}
      </div>
    );
  }
}

export default App;
