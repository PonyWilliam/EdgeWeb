<template>
    <div class="container">
        <div class="charts">
            <div id="chart1" style="width: 40vw;height:400px;">
            </div>
            <div id="chart2" style="width: 40vw;height:400px;">
            </div>
            <div id="chart3" style="width: 40vw;height:400px;">
            </div>
            <div id="chart4" style="width: 40vw;height:400px;">
            </div>
        </div>
        <div class="list">
            <!--列出所有主机列表-->

        </div>
    </div>
</template>
<style>
    .charts{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        flex-wrap: wrap;
    }
</style>
<script setup lang="ts">
    import {ref} from 'vue' // ref -> 响应式
    import {onMounted} from 'vue'
    import * as echarts from 'echarts'
    let temp = JSON.parse(localStorage.getItem("server"))._value
    let option1,option2,option3,option4 = {}
    let allRes = []
    const MyFetch1 = (ip) => {
        return new Promise((resolve,reject)=>{
            fetch(`http://${ip}/status/all`,{
            method:"GET",
            }).then(data=>data.json()).then(data=>{
                console.log("online + 1:")
                if(data.code == 200){
                    resolve("on")
                    //加入到数组中
                    allRes.push(data.data)
                }else{
                    resolve("off")
                }
            }).catch(err=>{
                console.log("offline + 1:")
                resolve("off")
            })
        })
    }
    // const MyFetch2 = (ip) => {
    //     return new Promise((resolve,reject)=>{
            
    //     })
    // }
    const MyWait1 = async (ip) => {
        let offline=0,online = 0
        for(let x in temp){
            console.log(temp[x]["ip"])
            const tmp = await MyFetch1(temp[x]["ip"])
            if(tmp == "on"){
                online += 1
            }else{
                offline += 1
            }
        }
        option1 = {
        title:{text:"主机在线情况",left:'center',top:'center'},
        series: [
            {
            label:{
                normal:{
                    formatter:'{b}:{c}({d}%)',
                    textStyle:{
                        fontWeight:'normal',
                        fontSize:15,
                    }
                }
            },
            type: 'pie',
            color:[
                '#33af55',
                '#a3a3a3'
            ],
            data: [
                {
                    value:online,
                    name:'在线'
                },
                {
                    value:offline,
                    name:'离线'
                }
            ],
            radius: ['40%', '70%']
            }
        ]
    };
    let allCpu = 0
    for(let x in allRes){
        allCpu += allRes[x].cpu
    }
    allCpu /= allRes.length
    console.log(allCpu)
    option2 = {
        title:{text:"平均CPU占用",left:'center',top:'center'},
        series: [
            {
            label:{
                normal:{
                    formatter:'{b}:{c}%',
                    textStyle:{
                        fontWeight:'normal',
                        fontSize:15,
                    }
                }
            },
            type: 'pie',
            color:[
                '#df3522',
                '#33af55'
            ],
            data: [
                {
                    value:allCpu,
                    name:'已用'
                },
                {
                    value:100 - allCpu,
                    name:'空闲'
                }
            ],
            radius: ['40%', '70%']
            }
        ]
    };
    let allMem = 0
    let useMem = 0
    for(let x in allRes){
        allMem += allRes[x].allmem
        useMem += allRes[x].usemem
    }
    console.log(useMem,allMem)
    option3 = {
        title:{text:"总体内存使用总情况",left:'center',top:'center'},
        series: [
            {
            label:{
                normal:{
                    formatter:'{b}:{c}M',
                    textStyle:{
                        fontWeight:'normal',
                        fontSize:15,
                    }
                }
            },
            type: 'pie',
            color:[
                '#df3522',
                '#33af55'
            ],
            data: [
                {
                    value:useMem,
                    name:'已用'
                },
                {
                    value:allMem - useMem,
                    name:'空闲'
                }
            ],
            radius: ['40%', '70%']
            }
        ]
    };
    let Allarch = {}
    for(let x in allRes){
        if(Allarch[allRes[x].arch] == NaN){
            Allarch[allRes[x].arch] += 1
            continue
        }
        Allarch[allRes[x].arch] = 1
    }
    let op4data = []
    for(let x in Allarch){
        let tmp = {}
        tmp.name = x
        tmp.value = Allarch[x]
        op4data.push(tmp)
    }
    option4 = {
        title:{text:"架构分类",left:'center',top:'center'},
        series: [
            {
            label:{
                normal:{
                    formatter:'{b}:{c}',
                    textStyle:{
                        fontWeight:'normal',
                        fontSize:15,
                    }
                }
            },
            type: 'pie',
            data: op4data,
            radius: ['40%', '70%']
            }
        ]
    };
    }
    
    const UpdateInTimer = async ()=>{
        allRes = []//清空状态
        await MyWait1()
        
        let chart1 = echarts.init(document.getElementById("chart1"));
        let chart2 = echarts.init(document.getElementById("chart2"));
        let chart3 = echarts.init(document.getElementById("chart3"));
        let chart4 = echarts.init(document.getElementById("chart4"))
        chart1.setOption(option1)
        chart2.setOption(option2)
        chart3.setOption(option3)
        chart4.setOption(option4)

    }

    onMounted(async ()=>{
        UpdateInTimer()
        let timer = setInterval(UpdateInTimer,5 * 1000)
    })
</script>