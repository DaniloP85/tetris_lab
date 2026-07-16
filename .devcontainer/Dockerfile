FROM node:20-alpine

RUN apk add --no-cache \
    bash git curl libc6-compat gcompat \
    openjdk21-jdk \
    github-cli \
    python3 py3-pip

RUN npm install -g @anthropic-ai/claude-code

RUN mkdir -p /home/node/.claude /home/node/.config/gh \
    && chown -R node:node /home/node/.claude /home/node/.config

ENV JAVA_HOME=/usr/lib/jvm/java-21-openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Prompt: usuário verde, caminho azul, branch amarela
RUN cat >> /home/node/.bashrc << 'EOF'
parse_git_branch() {
  git branch 2>/dev/null | sed -n 's/^\* \(.*\)/ (\1)/p'
}
export PS1='\[\e[1;32m\]\u\[\e[0m\]:\[\e[1;34m\]\w\[\e[1;33m\]$(parse_git_branch)\[\e[0m\]\$ '
EOF

RUN chown node:node /home/node/.bashrc

USER node
WORKDIR /workspace

# ---- .gitconfig ----
RUN git config --global user.name "Danilo Santos" \
    && git config --global user.email "danilopsnts@gmail.com"

# ---- uv + spec-kit (specify-cli) ----
# uv se instala em ~/.local/bin por padrão; garantimos isso no PATH
ENV PATH="/home/node/.local/bin:${PATH}"

RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
    && uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# sanity check em build time (falha o build se algo deu errado)
RUN uv --version && specify --help > /dev/null