import React from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";

function Servicos(){
    const [servicos, setServicos] = useState([]);
    

    useEffect(() => {
        const fetchServicos = async () => {
            try{
                const response = await axios.get('http://localhost:3001/api/servicos');
                setServicos(response.data);
            } catch (error){
                console.error('Erro ao buscar serviços:', error);
            }
        };
        fetchServicos();
    }, []);

    return (
    <div className="container" style={{ padding: '20px' }}>
      <h2>Nossos Serviços</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {servicos.map(servico => (
          <div key={servico.id} className="card-servico"> {/* Usa nossa classe personalizada */}
            <h3>{servico.nome}</h3>
            <p>{servico.descricao}</p>
            <p><strong>Duração:</strong> {servico.duracao_minutos} min</p>
            <p><strong>Preço:</strong> R$ {servico.preco.toFixed(2)}</p>
            <Link to={`/agendar/${servico.id}`}>
              <button>Agendar Agora</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Servicos;