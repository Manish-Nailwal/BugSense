import React from "react";
import { useUiStore } from "../../store/uiStore";
import SettingsModal from "./SettingsModal";

/**
 * Mounted once at the app root. Renders the unified "Control Center"
 * (SettingsModal) so it's reachable from any page via openSettings(tab).
 */
const AccountModals = () => {
  const { activeModal, modalTab, closeModal } = useUiStore();

  return (
    <SettingsModal
      open={activeModal === "settings"}
      initialTab={modalTab}
      onClose={closeModal}
    />
  );
};

export default AccountModals;
