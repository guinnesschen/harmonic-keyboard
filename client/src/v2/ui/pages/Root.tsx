import { SettingsProvider } from "../../state/settingsStore";
import Main from "./Main";

export default function Root() {
  return (
    <SettingsProvider>
      <Main />
    </SettingsProvider>
  );
}
