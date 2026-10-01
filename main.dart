import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

const String appVersion = 'V25.0';
const String legacyAsset = 'assets/webcore/index.html';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // This app intentionally does not require Node/npm. The Flutter shell loads
  // the feature-preserving web core from bundled assets on Android/iOS.
  // Supabase is used by the web core only when Community Sync is enabled.
  runApp(const WinterArcApp());
}

class WinterArcApp extends StatelessWidget {
  const WinterArcApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Winter Arc Tracker',
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF3DA35D),
        scaffoldBackgroundColor: const Color(0xFFF5F3ED),
      ),
      home: const WinterArcHost(),
    );
  }
}

class WinterArcHost extends StatefulWidget {
  const WinterArcHost({super.key});

  @override
  State<WinterArcHost> createState() => _WinterArcHostState();
}

class _WinterArcHostState extends State<WinterArcHost> {
  InAppWebViewController? _controller;
  bool _loading = true;
  bool _failed = false;
  double _progress = 0;
  String _error = '';

  InAppWebViewSettings get _settings => InAppWebViewSettings(
        javaScriptEnabled: true,
        javaScriptCanOpenWindowsAutomatically: true,
        transparentBackground: false,
        mediaPlaybackRequiresUserGesture: false,
        allowsInlineMediaPlayback: true,
        useHybridComposition: true,
        supportZoom: false,
        disableVerticalScroll: false,
        disableHorizontalScroll: true,
        builtInZoomControls: false,
        displayZoomControls: false,
        isInspectable: kDebugMode,
        cacheEnabled: true,
        thirdPartyCookiesEnabled: false,
        clearCache: false,
        safeBrowsingEnabled: true,
      );

  Future<void> _load() async {
    setState(() {
      _failed = false;
      _loading = true;
      _progress = 0;
      _error = '';
    });
    try {
      await _controller?.loadFile(assetFilePath: legacyAsset);
    } catch (e) {
      setState(() {
        _failed = true;
        _loading = false;
        _error = '$e';
      });
    }
  }

  Future<bool> _handleBack() async {
    final c = _controller;
    if (c != null && await c.canGoBack()) {
      await c.goBack();
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _handleBack();
        if (shouldPop && mounted) {
          await SystemNavigator.pop();
        }
      },
      child: Scaffold(
        body: SafeArea(
          bottom: false,
          child: Stack(
            fit: StackFit.expand,
            children: [
              InAppWebView(
                initialSettings: _settings,
                onWebViewCreated: (controller) {
                  _controller = controller;
                  _load();
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    _loading = true;
                    _failed = false;
                  });
                },
                onLoadStop: (controller, url) {
                  setState(() {
                    _loading = false;
                  });
                },
                onProgressChanged: (controller, progress) {
                  setState(() {
                    _progress = progress / 100;
                  });
                },
                onReceivedError: (controller, request, error) {
                  // Don't replace the app for recoverable subresource failures.
                  if (request.isForMainFrame ?? true) {
                    setState(() {
                      _failed = true;
                      _loading = false;
                      _error = error.description;
                    });
                  }
                },
                onConsoleMessage: (controller, consoleMessage) {
                  if (kDebugMode) {
                    debugPrint('[WinterArc JS] ${consoleMessage.message}');
                  }
                },
              ),
              if (_loading)
                IgnorePointer(
                  child: ColoredBox(
                    color: Color(0xFFF5F3ED),
                    child: Center(
                      child: SizedBox(
                        width: 260,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('❄️', style: TextStyle(fontSize: 42)),
                            const SizedBox(height: 12),
                            const Text(
                              'Winter Arc',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 12),
                            LinearProgressIndicator(value: _progress == 0 ? null : _progress),
                            const SizedBox(height: 10),
                            Text(
                              _progress == 0
                                  ? 'Loading your Arc…'
                                  : '${(_progress * 100).round()}%',
                              style: const TextStyle(fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              if (_failed)
                ColoredBox(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('⚠️', style: TextStyle(fontSize: 44)),
                          const SizedBox(height: 12),
                          const Text(
                            'Winter Arc could not open',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _error.isEmpty
                                ? 'The local app shell is unavailable.'
                                : _error,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 13),
                          ),
                          const SizedBox(height: 18),
                          FilledButton.icon(
                            onPressed: _load,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Retry'),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '$appVersion · No npm required',
                            style: TextStyle(
                              fontSize: 11,
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
