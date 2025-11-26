import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function Articles(){
  const [list, setList] = useState([]);
  useEffect(()=>{
    axios.get('/api/articles').then(r=> setList(r.data)).catch(()=>{});
  },[]);
  return (
    <div>
      <h1>Kiến thức chăm sóc</h1>
      <div style={{display:'grid', gap:12}}>
        {list.map(a=> (
          <article key={a._id} style={{border:'1px solid #eee',padding:12,borderRadius:8}}>
            <h3>{a.title}</h3>
            <p>{a.summary}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
