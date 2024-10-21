## Related Repositories

```bash
git clone https://github.com/joshnewans/serial_motor_demo
git clone https://github.com/matlabbe/kinect_ros2
```

## Pip dependency

```bash
pip3 install pyserial
```


## rtabmap & rosbridge

```bash
sudo apt install libfreenect-dev -y
sudo apt install ros-humble-rtabmap-ros -y

sudo apt install ros-humble-rosbridge-suite -y
```


## Run rtabmpa, rosbridge, serial_motor_demo etc

```bash

ros2 run serial_motor_demo driver --ros-args -p encoder_cpr:=408 -p loop_rate:=30 -p serial_port:=/dev/ttyUSB0 -p baud_rate:=57600

ros2 launch rosbridge_server rosbridge_websocket_launch.xml

ros2 launch rtabmap_examples kinect_xbox_360_params.launch.py approx_sync:=true sync_queue_size:=20 topic_queue_size:=10
```

## run server

```bash
python3 -m http.server 8000
```
