#!venv/bin/python
# -*-coding:utf-8-*-
import schedule, subprocess, time
from flask_script import Manager
from app.tables.IAT import Task as IATTask
from app import app, db

manager = Manager(app)

# 定义TimScript类 包括任务id和任务启停
#
class TimScript():
  def __init__(self, taskId):
    self.taskId = taskId
    self.stop = 0 # 0 代表任务是停止的

  def getTaskStatus(self, taskId):
    # 获取任务的状态
    rowData = IATTask.query.filter_by(id=taskId).first()
    db.session.commit()
    if rowData:
      return rowData.status, rowData.run_time
    else:
      return None, None


  def start_job(self, taskId):
    subprocess.call("python runTest.py runScript -i %s" % taskId, shell=True)


  def stop_job(self, taskId):
    status, runTime = self.getTaskStatus(taskId)
    if status == 4:
      self.stop = 1

  def runScript(self):
    status, runTime = self.getTaskStatus(self.taskId)
    if runTime and status:
      print("API定时任务开始：taskId-", self.taskId, "runTime -", runTime)
      schedule.every().day.at(str(runTime)).do(self.start_job, self.taskId) # 每天的设置的runTime启动任务
      schedule.every(10).seconds.do(self.stop_job, self.taskId) # 每隔10秒钟去停止任务
    else:
      print("run API timing task [%s] error" % self.taskId)

    while True:
      schedule.run_pending()
      time.sleep(1)
      if self.stop == 1:
        print("定时时任务关闭：taskId-", self.taskId, )
        break

@manager.option('-i', '--task_id', dest='task_id', default='')
def runScript(task_id):
  mainScript = TimScript(task_id)
  mainScript.runScript()


if "__main__" == __name__:
  manager.run()
