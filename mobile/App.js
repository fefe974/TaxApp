import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { WEB_APP_HTML } from './assets/web/webAppHtml';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#00264F" />
      <WebView
        originWhitelist={['*']}
        source={{ html: WEB_APP_HTML }}
        style={styles.webview}
        allowFileAccess
        domStorageEnabled
        javaScriptEnabled
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00264F',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
