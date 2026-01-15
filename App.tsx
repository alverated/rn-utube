import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LibraryProvider } from './src/state/LibraryContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
