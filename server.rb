require 'webrick'

port = 8080
root = File.expand_path('.', __dir__)

server = WEBrick::HTTPServer.new(
  Port: port,
  BindAddress: '0.0.0.0',
  Logger: WEBrick::Log.new($stdout, WEBrick::Log::INFO),
  AccessLog: [[$stdout, WEBrick::AccessLog::COMBINED_LOG_FORMAT]]
)

server.mount_proc '/' do |req, res|
  # Default to index.html
  clean_path = req.path.split('?').first
  clean_path = '/index.html' if clean_path == '/' || clean_path.empty?
  
  file_path = File.expand_path("." + clean_path, root)

  # Security: Prevent directory traversal
  if file_path.start_with?(root) && File.file?(file_path)
    ext = File.extname(file_path).downcase
    res['Content-Type'] = case ext
      when '.html' then 'text/html; charset=utf-8'
      when '.js'   then 'application/javascript; charset=utf-8'
      when '.css'  then 'text/css; charset=utf-8'
      when '.json' then 'application/json; charset=utf-8'
      when '.svg'  then 'image/svg+xml'
      when '.png'  then 'image/png'
      when '.jpg', '.jpeg' then 'image/jpeg'
      when '.ico'  then 'image/x-icon'
      else 'text/plain; charset=utf-8'
    end
    # Reading as string completely avoids IO.copy_stream / sendfile Errno::EPERM!
    res['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    res['Pragma'] = 'no-cache'
    res['Expires'] = '0'
    res.body = File.binread(file_path)
  else
    res.status = 404
    res['Content-Type'] = 'text/plain'
    res.body = "File Not Found: #{clean_path}"
  end
end

trap('INT') { server.shutdown }

puts "=========================================================="
puts "⚡ Cognition Lab Server is ACTIVE!"
puts "   URL: http://localhost:#{port}"
puts "=========================================================="

server.start
