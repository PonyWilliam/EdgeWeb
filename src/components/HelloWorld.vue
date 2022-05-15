<script setup lang="ts">
// @ts-nocheck
import { saveAs} from '../utils/FileSaver'
import { ref,reactive } from "vue";
import { ElMessage } from 'element-plus'


const count = ref(0);
const input = ref("element-plus");
const ip = ref('')

const res = ref(reactive([]))
const result = ref(reactive([]))

const FileInput = ref(null)

const port = 5755

let temp = localStorage.getItem("server")
if (temp == null){
    res.value = []
}else{
  res.value = JSON.parse(temp)._value;
}
console.log(res.value)

const updateInfo = (x) => {
  //1. 更新状态信息
  fetch(`http://${x["ip"]}/status/all`,{
      method:"GET",
    }).then(data=>data.json()).then(data=>{
      result.value[x["id"]] = data.data
      //2. 更新vnc状态信息
      // fetch(`http://${x["ip"].split(":")[0]}:${port}/vnc.html`,{
      //   method:"GET",
      // }).then(_=>{
      //   //可以使用
      //   result.value[x["id"]].vncinfo = "状态正常"
      // }).catch(err=>{
      //   result.value[x["id"]].vncinfo = "无法连接"
      // })
    }).catch(err=>{
      console.log(err)
      result.value[x["id"]] = "离线"
    })
}

let timertick = ()=>{
  for(let x of res.value){
      updateInfo(x)//定时更新状态信息

  }
}
timertick()
setInterval(timertick,5000)//5秒扫描一次数据

const savetoLocal = () => {
  //首先检查IP是否有服务端，有的话就允许访问
  fetch(`http://${ip.value}/status/check`,{
    method:"GET",
  }).then(res=>res.json()).then(data=>{
    if(data.code == 200){
      let obj = {}
      obj["ip"] = ip.value
      if (res.value.length > 0){
        //使用最后 + 1作为ID
        obj["id"] = res.value[res.value.length - 1]["id"] + 1
      }else{
        obj["id"] = 1
      }
      res.value.push(obj)
      localStorage.setItem("server",JSON.stringify(res))
      SetSuccess()
      ip.value = ""
    }else{
      ElMessage({
        showClose: true,
        message: '无法连接到IP服务端，请检查IP地址是否正确',
        type: 'error',
      })
      return
    }
  }).catch(err=>{
    ElMessage({
      showClose: true,
      message: '无法连接到IP服务端，请检查IP地址是否正确',
      type: 'error',
    })
    return
  })
}
const delLocal = (id)=>{
  for(let x in res.value){
    if(res.value[x]["id"] == id){
      //删除
      res.value.splice(x,1)
      localStorage.setItem("server",JSON.stringify(res))
      ElMessage.success("删除成功")
      break
    }
  }
}

const timer = function(){
  if(res.value.length > 0){
     
  }
}

const SetSuccess = () => {
  ElMessage.success('添加成功')
}

const reboot = (id) =>{
  for(let x of res.value){
    if(x.id == id){
      //请求更新
      fetch(`http://${x.ip}/control/reboot`,{
        method:"GET"
      }).then(res=>res.json()).then(data=>{
        if(typeof data != 'object'){
          ElMessage({
            showClose: true,
            message: 'reboot失败',
            type: 'error',
          })
          return
        }
        if(data.code == 200){
          ElMessage.success(`${x.ip}已重启`)
        }
      })
      break
    }
  }
}

const poweroff = (id) => {
  for(let x of res.value){
    if(x.id == id){
      //请求更新
      fetch(`http://${x.ip}/control/poweroff`,{
        method:"GET"
      }).then(res=>res.json()).then(data=>{
        if(typeof data != 'object'){
          ElMessage({
            showClose: true,
            message: 'reboot失败',
            type: 'error',
          })
          return
        }
        if(data.code == 200){
          ElMessage.success(`${x.ip}已重启`)
        }
      })
      break
    }
  }
}

const downloadtxt = ()=> {
  let txt = "bjitec\n"
  for(let x of res.value){
    txt += x.ip
    txt += "\n"
  }
  let blob = new Blob([txt],{type: "text/plain;charset=utf-8"})
  saveAs(blob,"list.txt")
}

const importlist = () => {
  //使用ref去调用
  FileInput.value.click()
}
//导入文件接口
const filechange = (value)=>{
  let reader = new FileReader()
  reader.onload = function(){
    if(reader.result){
        //开始导入IP地址
        let text = reader.result.split("\n")
        if(text[0] != "bjitec"){
          //格式不正确
          ElMessage({
            type:"error",
            message:"导入文件格式不正确"
          })
          return
        }
        
        let temp_res = []
        for(let i = 1;i<text.length - 1;i++){
          let obj = {}
          obj.id = i
          obj.ip = text[i]
          temp_res.push(obj)
        }
        console.log(temp_res)
        //传递给res同时保存到localstorage
        res.value = temp_res
        localStorage.setItem("server",JSON.stringify(res))
        ElMessage.success("导入成功")
    }
  }
  reader.readAsText(value.target.files[0])
}

//删除主机列表
const delAll = () => {
  res.value = []
  localStorage.setItem("server",JSON.stringify(res))
}
const openVnc = (ip) => {
  ip = ip.split(":")[0]
  window.open(`http://${ip}:${port}/vnc.html`)
}
</script>

<template>
  <div class="container">
    <div class="header_control">
        <div class="add">
          添加新主机到面板:
          <el-input v-model="ip" placeholder="请输入IP地址" />
          <el-button type="primary" @click="savetoLocal()">添加</el-button>
        </div>
        <div class="interval">
          设置刷新间隔:
        </div>
    </div>
    <div class="content-header">
      <el-button class="normal export" type="primary" round @click="downloadtxt">
        导出主机列表
      </el-button>
      <el-popconfirm title="导入主机列表会导致现有主机被覆盖，是否继续" @confirm="importlist">
        <template #reference>
          <el-button class="normal import" type="primary" round>
            导入主机列表
          </el-button>
        </template>
      </el-popconfirm>
      <el-popconfirm title="删除全部主机将无法恢复" @confirm="delAll">
        <template #reference>
          <el-button class="normal import" type="warning" round>
            删除全部主机列表
          </el-button>
        </template>
      </el-popconfirm>
      <input type="file" v-show="false" id="FileInput" ref="FileInput" @change="filechange">
    </div>
    <div class="card-container">
      <el-card class="box-card" v-for="(item,i) in res" :key="i">
        <template #header>
          <div class="card-header">
            <span class="header_title">{{item["id"]}}</span><span>{{item["ip"]}}</span>
          </div>
        </template>
        <div class="text item">当前在线状态:<span :class="typeof result[item['id']] === 'object' ? 'green' : 'red'">{{typeof result[item["id"]] == 'object' ?result[item["id"]]["status"] : "离线"}}</span></div>
        <div class="text item">CPU种类:{{typeof result[item["id"]] == 'object' ?result[item["id"]]["cpuinfo"] + "( X" + result[item["id"]]["cpuCores"] + " )" : "未知"}}</div>
        <div class="text item">CPU占用率:{{typeof result[item["id"]] == 'object' ?result[item["id"]]["cpu"] + "%" : "未知"}}</div>
        <div class="text item">MEM(已用/总大小):{{typeof result[item["id"]] == 'object' ? result[item["id"]]["usemem"] + "MB / " + result[item["id"]]["allmem"]+"MB" : "未知"}}</div>
        <div class="text item">磁盘信息:{{typeof result[item["id"]] == 'object' ? result[item["id"]]["disk"] : "未知"}}</div>
        <div class="text item">操作系统:{{typeof result[item["id"]] == 'object' ? result[item["id"]]["system"] : "未知"}}</div>
        <!-- <div class="text item">vnc状态:{{typeof result[item["id"]] == 'object' ? result[item.id].vncinfo : "未知"}}</div> -->
        <div class="display">
          <!-- <el-button @click="openVnc(item.ip)" class="" v-show="typeof result[item.id] == 'object' && result[item.id].vncinfo == '状态正常'" type="primary" round>连接到VNC</el-button> -->
          <el-button @click="openVnc(item['ip'])" class="" type="primary" round>连接到VNC</el-button>
          <el-popconfirm title="是否确认删除（无法恢复）" @confirm="delLocal(item['id'])">
            <template #reference>
              <el-button type="primary" round >删除该主机</el-button>
            </template>
          </el-popconfirm>
          
        </div>
        <div class="control">
          <!-- 控制区域 -->
          
          <el-popconfirm title="确认关机吗（本程序无法控制开机）" @confirm="poweroff(item['id'])">
            <template #reference>
              <el-button class="controlItem" type="danger" round>关机</el-button>
            </template>
            
          </el-popconfirm>
          <el-popconfirm title="确认重启吗？" @confirm="reboot(item['id'])">
            <template #reference>
            <el-button class="controlItem" type="warning" round>重启</el-button>
            </template>
          </el-popconfirm>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss">
.content-header{
    display: flex;
    flex-direction: row;
    justify-content: left;
    padding:10px 40px;
    .normal{
      padding:18px 30px;
    }
}
.green{
  color:rgb(8, 159, 63)
}
.red{
  color:rgb(228, 20, 20);
}
.container .card-container{
  display: flex;
  box-sizing: border-box;
  padding:15px 25px;
  width:calc(100vw - 100px);
}
.container .card-container .box-card{
  box-sizing: border-box;
  width:20%;
  margin-left:4%;
  .card-header{
    justify-content: left;
  }
  .header_title{
    color:orange;
    font-size:20px;
    margin-right:20px;
  }
  .text{
    text-align: left;
  }
  .control{
    display: flex;
    justify-content: center;
    margin-top:15px;
    .controlItem{
      display: flex;
      padding: 10px 22px;
    }
  }
}
.container{
  padding:20px 5px;
  box-sizing: border-box;
}
.container .header_control{
  font-size:18px;
  line-height:40px;
  padding-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  padding:10px 20px;
  border-radius: 15px;
}
.display{
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
</style>

<style>
.el-button {
  margin: 4px;
}
</style>
