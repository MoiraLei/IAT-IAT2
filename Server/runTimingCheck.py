#!venv/bin/python
#-*-coding:utf-8-*-
import time, json, subprocess
from flask_script import Manager
from app.tables.IAT import Task as IATTask
from app import app, db

# Flask Script扩展提供向Flask插入外部脚本的功能，
# 包括运行一个开发用的服务器，一个定制的Python shell，设置数据库的脚本，cronjobs，
# 及其他运行在web应用之外的命令行任务；使得脚本和系统分开；
# 本文中此代码只是实现Manager的一种方式，最终都会去调用函数runTimTask()

manager = Manager(app)

def runTimTask():
    # 查询任务表，获取 状态为  且类型为 定时任务的数据
    iatTimTaskDatas = IATTask.query.filter(db.and_(IATTask.status.notin_([0,4]),IATTask.task_type == 2)).all()
    # 遍历数据，并将定制任务进行执行  传入id  python runTiming.py runScript -i 222
    for timTask in iatTimTaskDatas:
        subprocess.Popen('python runTiming.py runScript -i %s' % timTask.id, shell=True)

@manager.command
def main():
    runTimTask()

if __name__ == '__main__':
    manager.run()
