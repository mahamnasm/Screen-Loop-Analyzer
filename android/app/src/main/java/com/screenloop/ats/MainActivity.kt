package com.screenloop.ats

import android.Manifest
import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.webkit.*
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.floatingactionbutton.FloatingActionButton

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var btnSettings: FloatingActionButton
    private lateinit var connectionOverlay: LinearLayout
    private lateinit var txtStatus: TextView
    private lateinit var btnConnectWifi: Button
    private lateinit var btnConnectHotspot: Button
    private lateinit var btnConnectEmulator: Button
    private lateinit var editCustomUrl: EditText
    private lateinit var btnConnectCustom: Button

    private lateinit var prefs: SharedPreferences

    // Default primary URLs
    private val defaultWifiUrl = "http://10.20.146.15:8080"
    private val defaultHotspotUrl = "http://192.168.137.1:8080"
    private val defaultEmulatorUrl = "http://10.0.2.2:8080"
    private val defaultRenderUrl = "https://screenloop-ats.onrender.com"

    private var currentUrl: String = ""
    private val permissionRequestCode = 101

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        prefs = getSharedPreferences("screenloop_mobile_prefs", Context.MODE_PRIVATE)

        webView = findViewById(R.id.webView)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)
        btnSettings = findViewById(R.id.btnSettings)
        connectionOverlay = findViewById(R.id.connectionOverlay)
        txtStatus = findViewById(R.id.txtStatus)
        btnConnectWifi = findViewById(R.id.btnConnectWifi)
        btnConnectHotspot = findViewById(R.id.btnConnectHotspot)
        btnConnectEmulator = findViewById(R.id.btnConnectEmulator)
        editCustomUrl = findViewById(R.id.editCustomUrl)
        btnConnectCustom = findViewById(R.id.btnConnectCustom)

        swipeRefresh.setColorSchemeResources(R.color.accent_almond, R.color.primary_navy)
        swipeRefresh.setOnRefreshListener {
            if (currentUrl.isNotEmpty()) {
                webView.loadUrl(currentUrl)
            } else {
                swipeRefresh.isRefreshing = false
            }
        }

        checkAndRequestPermissions()
        setupWebView()
        setupConnectionControls()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (connectionOverlay.visibility == View.VISIBLE && currentUrl.isNotEmpty()) {
                    connectionOverlay.visibility = View.GONE
                } else if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Determine starting URL
        val savedUrl = prefs.getString("custom_server_url", null)
        val initialUrl = savedUrl ?: defaultWifiUrl
        connectToUrl(initialUrl)
    }

    private fun setupConnectionControls() {
        btnSettings.setOnClickListener {
            toggleConnectionOverlay()
        }

        btnConnectWifi.setOnClickListener {
            connectToUrl(defaultWifiUrl)
        }

        btnConnectHotspot.setOnClickListener {
            connectToUrl(defaultHotspotUrl)
        }

        btnConnectEmulator.setOnClickListener {
            connectToUrl(defaultEmulatorUrl)
        }

        btnConnectCustom.setOnClickListener {
            var url = editCustomUrl.text.toString().trim()
            if (url.isNotEmpty()) {
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    url = "https://$url"
                }
                connectToUrl(url)
            } else {
                Toast.makeText(this, "Please enter a URL", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun connectToUrl(url: String) {
        currentUrl = url
        prefs.edit().putString("custom_server_url", url).apply()
        connectionOverlay.visibility = View.GONE
        txtStatus.text = "Connecting to: $url..."
        progressBar.visibility = View.VISIBLE
        webView.loadUrl(url)
    }

    private fun toggleConnectionOverlay() {
        if (connectionOverlay.visibility == View.VISIBLE) {
            connectionOverlay.visibility = View.GONE
        } else {
            editCustomUrl.setText(currentUrl)
            connectionOverlay.visibility = View.VISIBLE
        }
    }

    private fun showConnectionError(reason: String) {
        runOnUiThread {
            swipeRefresh.isRefreshing = false
            progressBar.visibility = View.GONE
            txtStatus.text = "Cannot connect to server ($reason).\nChoose your connection target below:"
            editCustomUrl.setText(currentUrl)
            connectionOverlay.visibility = View.VISIBLE
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadsImagesAutomatically = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url.toString()
                
                // Open external links (e.g. Google Meet, LinkedIn) in system browser or Meet app
                if (url.contains("meet.google.com") || url.contains("linkedin.com") || url.startsWith("mailto:") || url.startsWith("tel:")) {
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        return false
                    }
                }
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                swipeRefresh.isRefreshing = false
                progressBar.visibility = View.GONE

                // Inspect page text to detect Render "Not Found" 404 text response
                view?.evaluateJavascript("(function() { return document.body ? document.body.innerText.trim() : ''; })();") { result ->
                    val bodyText = result?.replace(""", "")?.trim() ?: ""
                    if (bodyText.equals("Not Found", ignoreCase = true) || bodyText.contains("404 Not Found")) {
                        showConnectionError("Server returned 'Not Found'")
                    }
                }
            }

            override fun onReceivedHttpError(view: WebView?, request: WebResourceRequest?, errorResponse: WebResourceResponse?) {
                if (request?.isForMainFrame == true) {
                    val code = errorResponse?.statusCode ?: 0
                    if (code == 404 || code >= 500) {
                        showConnectionError("HTTP $code")
                    }
                }
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                if (request?.isForMainFrame == true) {
                    showConnectionError("Network connection failed")
                }
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                }
            }

            // Grant camera and microphone permissions for Google Meet in-app calls
            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread {
                    request?.grant(request.resources)
                }
            }
        }

        // Handle file downloads (CV download, Picture CV PNG export)
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            try {
                val request = DownloadManager.Request(Uri.parse(url))
                request.setMimeType(mimetype)
                request.addRequestHeader("User-Agent", userAgent)
                request.setDescription("Downloading Screenloop ATS document...")
                request.setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                request.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    URLUtil.guessFileName(url, contentDisposition, mimetype)
                )
                val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
                dm.enqueue(request)
                Toast.makeText(this, "Downloading file to Downloads...", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                startActivity(intent)
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO
        )
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            permissions.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
        }

        val needed = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), permissionRequestCode)
        }
    }
}
