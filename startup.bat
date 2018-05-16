:: mongodb elasticsearch flask kibana. logstash 不需要启动

start "mongod" "D:\Program Files\MongoDB\Server\3.0\bin\mongod.exe" &
ping localhost -n 1 > nul

start "elasticsearch" "D:\Downloads\elasticsearch-rtf\bin\elasticsearch.bat" &
ping localhost -n 10 > nul

start "flask server" "D:\GitHub\blogforfun\startserver.bat" &
ping localhost -n 2 > nul

start "kibana" "D:\Downloads\kibana-4.4.0-windows\bin\kibana.bat" &
ping localhost -n 4 > nul

::start "logstash" "D:\Downloads\logstash-2.4.1\bin\logstash.bat"
