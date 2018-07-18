import React, { PureComponent } from "react";
import styles from "./styles.scss";

class Modal extends PureComponent {
  constructor(props) {
    super(props);

    this.modalOverlay = React.createRef();
  }

  componentDidMount() {
    document.addEventListener("click", this.handleClick);
  }

  componentWillUnmount() {
    document.addEventListener("click", this.handleClick);
  }

  handleClick = e => {
    if (this.modalOverlay.current === e.target) {
      this.props.closeModal();
    }
  };

  render() {
    const { isOpen, children } = this.props;

    if (!isOpen) {
      return null;
    }

    return (
      <div className={styles.modal} ref={this.modalOverlay}>
        <div className={styles.modalWindow}>{children}</div>
      </div>
    );
  }
}

export default Modal;
