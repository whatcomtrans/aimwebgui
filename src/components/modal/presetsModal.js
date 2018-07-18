import React from "react";
import Modal from "./modal";
import styles from "./styles.scss";

const PresetsModal = ({ isOpen, presets, closeModal, selectPreset }) => (
  <Modal isOpen={isOpen} closeModal={closeModal}>
    <div className={styles.header}>
      <div>Presets</div>

      <button className={styles.closeButton} onClick={closeModal}>
        X
      </button>
    </div>
    <div>
      {presets &&
        presets.map(preset => (
          <div
            className={styles.preset}
            onClick={() => {
              selectPreset(preset.cp_id);
            }}
            key={preset.cp_id}
          >
            {preset.cp_name}
          </div>
        ))}
    </div>
  </Modal>
);

export default PresetsModal;
