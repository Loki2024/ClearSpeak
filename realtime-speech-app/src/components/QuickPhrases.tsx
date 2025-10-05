import { useApp } from '../store'
import { speak } from '../audio/pipeline'
import { useState } from 'react'

export default function QuickPhrases(){
  const {phrases,addPhrase,removePhrase}=useApp()
  const [t,setT]=useState('')
  return (
    <div className="card">
      <h3>Quick phrases</h3>
      <div style={{display:'flex',gap:8}}>
        <input style={{flex:1}} value={t} onChange={e=>setT(e.target.value)} placeholder="Add phrase"/>
        <button onClick={()=>{if(t.trim()){addPhrase(t.trim());setT('')}}}>Add</button>
      </div>
      <div style={{marginTop:12,display:'flex',flexWrap:'wrap',gap:8}}>
        {phrases.map(p=>(
          <div key={p.id} style={{display:'flex',alignItems:'center',gap:4}}>
            <button onClick={()=>speak(p.text)}>{p.text}</button>
            <button onClick={()=>removePhrase(p.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
