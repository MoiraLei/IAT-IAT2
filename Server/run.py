from app import app, socketio
import subprocess
# subprocess模块允许你启动一个新的进程，连接输入/输出/错误的管道，
# 获得子进程的返回码。这个模块目标是代替一些老的模块，比如os.system和os.spawn.


def runTimingCheck():
    # 该段代码表示执行cmd命令
    subprocess.Popen('python runTimingCheck.py main', shell=True)

if __name__ == '__main__':
    # 定时任务执行相关脚本运行监测
    runTimingCheck()
    # 当代码有变动的时候，关闭自动重启，使用use_reloader=False
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False)