"""Локальный статический сервер для разработки: отдаёт файлы без кэширования."""
import http.server, socketserver, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8931


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def send_response(self, *args, **kwargs):
        super().send_response(*args, **kwargs)


with socketserver.ThreadingTCPServer(('0.0.0.0', PORT), Handler) as httpd:
    httpd.allow_reuse_address = True
    print('Сервер запущен: http://localhost:%d' % PORT)
    httpd.serve_forever()
