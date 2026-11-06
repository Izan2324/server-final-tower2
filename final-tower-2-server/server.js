import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { randomInt } from 'node:crypto';

const app = express();
app.get('/', (_req,res) => res.json({service:'Final Tower 2 room server',status:'online'}));
app.get('/health', (_req,res) => res.json({ok:true,rooms:rooms.size}));
const httpServer = createServer(app);
const io = new Server(httpServer,{cors:{origin:'*',methods:['GET','POST']},pingInterval:25000,pingTimeout:20000});
const PORT = process.env.PORT || 3000;
const rooms = new Map();
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeCode(){let s='';for(let i=0;i<6;i++)s+=alphabet[randomInt(alphabet.length)];return s;}
function cleanRoom(r){return {code:r.code,visibility:r.visibility,capacity:r.capacity,difficulty:r.difficulty,players:r.members.size,playerNames:[...r.members.values()].map(p=>p.name),status:r.status};}
function emitRoom(r){io.to(r.code).emit('room-update',cleanRoom(r));}
function removeFromRoom(socket){const code=socket.data.roomCode;if(!code)return;const r=rooms.get(code);socket.leave(code);socket.data.roomCode=null;socket.data.role=null;if(!r)return;r.members.delete(socket.id);if(r.members.size===0){rooms.delete(code);return;}if(r.hostId===socket.id){r.hostId=r.members.keys().next().value;const newHost=r.members.get(r.hostId);if(newHost)newHost.name=(newHost.name||'Jugador')+' (anfitrión)';}emitRoom(r);}
io.on('connection',socket=>{
  socket.on('create-room',(data={},ack=()=>{})=>{
    const capacity=Math.max(2,Math.min(8,Number(data.capacity)||4));let code=makeCode();while(rooms.has(code))code=makeCode();
    const room={code,visibility:data.visibility==='public'?'public':'private',capacity,difficulty:['easy','mid','hard','nightmare'].includes(data.difficulty)?data.difficulty:'mid',status:'waiting',hostId:socket.id,members:new Map([[socket.id,{name:'Anfitrión'}]])};
    rooms.set(code,room);socket.join(code);socket.data.roomCode=code;socket.data.role='host';ack({ok:true,room:cleanRoom(room)});emitRoom(room);
  });
  socket.on('join-room',(data={},ack=()=>{})=>{
    const code=String(data.code||'').trim().toUpperCase();const r=rooms.get(code);
    if(!r)return ack({ok:false,error:'No existe una sala con ese código.'});
    if(r.status!=='waiting')return ack({ok:false,error:'La partida ya ha comenzado.'});
    if(r.members.size>=r.capacity)return ack({ok:false,error:'La sala está completa.'});
    if(socket.data.roomCode)removeFromRoom(socket);
    r.members.set(socket.id,{name:'Jugador '+(r.members.size+1)});socket.join(code);socket.data.roomCode=code;socket.data.role='guest';
    ack({ok:true,room:cleanRoom(r)});emitRoom(r);
  });
  socket.on('list-public-rooms',(_data={},ack=()=>{})=>{const list=[...rooms.values()].filter(r=>r.visibility==='public'&&r.status==='waiting'&&r.members.size<r.capacity).map(cleanRoom);ack({ok:true,rooms:list});});
  socket.on('start-room',(_data={},ack=()=>{})=>{const r=rooms.get(socket.data.roomCode);if(!r)return ack({ok:false,error:'La sala ya no existe.'});if(r.hostId!==socket.id)return ack({ok:false,error:'Solo el anfitrión puede iniciar la partida.'});if(r.status!=='waiting')return ack({ok:false,error:'La partida ya está iniciada.'});r.status='playing';const room=cleanRoom(r);ack({ok:true});io.to(r.code).emit('game-start',{room});});
  socket.on('leave-room',()=>removeFromRoom(socket));
  socket.on('disconnect',()=>removeFromRoom(socket));
});
httpServer.listen(PORT,'0.0.0.0',()=>console.log(`Final Tower 2 server listening on ${PORT}`));
