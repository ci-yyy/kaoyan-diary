#!/usr/bin/env python3
"""
考研日记 · 本地服务器
====================
双击 start.command 或在终端运行 python3 server.py
浏览器打开 http://localhost:8080 即可使用。

数据自动保存到本目录的 data.json 文件中。
把这个文件夹复制到其他电脑，数据还在。
"""

import http.server
import json
import os
import sys

PORT = 8080
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/load':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    self.wfile.write(f.read().encode('utf-8'))
            else:
                self.wfile.write(b'{}')
            return
        return super().do_GET()

    def do_POST(self):
        if self.path == '/api/save':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            data = json.loads(body)
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return
        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, fmt, *args):
        print(f'  ⇨  {fmt % args}')


def open_browser():
    import webbrowser
    try:
        webbrowser.open(f'http://localhost:{PORT}')
    except Exception:
        pass


if __name__ == '__main__':
    # 切换到脚本所在目录，确保正确提供静态文件
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'''
╔══════════════════════════════════════════╗
║        📚 考研日记 · 本地服务器            ║
║──────────────────────────────────────────║
║  浏览器: http://localhost:{PORT}           ║
║  数据:   {os.path.basename(DATA_FILE)}               ║
║                                          ║
║  Ctrl+C 停止服务器                       ║
╚══════════════════════════════════════════╝
''')
    server = http.server.HTTPServer(('0.0.0.0', PORT), Handler)
    open_browser()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n[考研日记] 服务器已停止')
        server.server_close()
        sys.exit(0)
