# Canal dos apps

Ramo de atualização dos apps do dono deste repositório.

- `m.bin` e os arquivos `.bin`: cifrados (AES-256-GCM). Só o app Instalador dele abre.
- `fontes/`: a fonte dos apps, cifrada do mesmo jeito.
- `publica.py`, `cofre.py`, `ferramentas.sh`: roteiros de publicar, guardar a fonte e baixar as ferramentas de montagem (sem segredo; a chave não fica aqui).
- `despertador/`: pacotes de regras do app Despertador (texto, sem segredo), usados como ponte para o Notion.
- `pc/`: os programas do computador (pomodoro), cifrados (formato MSD2, só biblioteca padrão). `publica_pc.py` publica (sem segredo; a chave não fica aqui).
