const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API de Livros, Autores e Comentários',
        version: '1.0.0',
        description: 'Documentação oficial da API protegida por autenticação JWT (Bearer) com controle de acesso baseado em perfis (RBAC).'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor Local de Desenvolvimento'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Insira o token JWT no formato: Bearer <seu_token>'
            }
        },
        schemas: {
            UserRegister: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                    nome: { type: 'string', example: 'Ana Souza' },
                    email: { type: 'string', format: 'email', example: 'ana.souza@email.com' },
                    senha: { type: 'string', format: 'password', example: 'senhaSegura123' },
                    role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' }
                }
            },
            UserLogin: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'ana.souza@email.com' },
                    senha: { type: 'string', format: 'password', example: 'senhaSegura123' }
                }
            },
            AutorCreate: {
                type: 'object',
                required: ['nome'],
                properties: {
                    nome: { type: 'string', example: 'Machado de Assis' },
                    nacionalidade: { type: 'string', example: 'Brasileira' }
                }
            },
            LivroCreate: {
                type: 'object',
                required: ['titulo', 'autor_id'],
                properties: {
                    titulo: { type: 'string', example: 'Dom Casmurro' },
                    ano: { type: 'integer', example: 1899 },
                    autor_id: { type: 'integer', example: 1 }
                }
            },
            ComentarioCreate: {
                type: 'object',
                required: ['texto'],
                properties: {
                    texto: { type: 'string', example: 'Uma obra-prima da literatura nacional!' }
                }
            }
        }
    },
    paths: {
        '/api/v1/livros': {
            get: {
                summary: 'Listar todos os livros',
                description: 'Rota pública que retorna a lista completa de livros cadastrados com seus respectivos autores.',
                tags: ['Livros'],
                responses: {
                    200: { description: 'Lista de livros retornada com sucesso.' },
                    500: { description: 'Erro interno no servidor.' }
                }
            },
            post: {
                summary: 'Cadastrar novo livro',
                description: 'Rota restrita a administradores (ADMIN) para cadastrar novas obras.',
                tags: ['Livros (Admin)'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LivroCreate' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Livro cadastrado com sucesso.' },
                    400: { description: 'Dados obrigatórios ausentes.' },
                    401: { description: 'Token ausente, expirado ou corrompido.' },
                    403: { description: 'Acesso negado (exclusivo para ADMIN).' },
                    404: { description: 'Autor informado não existe.' }
                }
            }
        },
        '/api/v1/livros/{id}': {
            get: {
                summary: 'Buscar livro por ID',
                description: 'Rota pública que retorna os detalhes de um livro específico.',
                tags: ['Livros'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID do livro'
                    }
                ],
                responses: {
                    200: { description: 'Livro encontrado com sucesso.' },
                    404: { description: 'Livro não localizado.' }
                }
            }
        },
        '/api/v1/livros/{id}/comentarios': {
            post: {
                summary: 'Adicionar comentário a um livro',
                description: 'Permite que usuários autenticados (USER ou ADMIN) adicionem comentários a um livro.',
                tags: ['Livros e Comentários'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer' },
                        description: 'ID do livro'
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ComentarioCreate' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Comentário adicionado com sucesso.' },
                    400: { description: 'Texto do comentário vazio.' },
                    401: { description: 'Token ausente ou inválido.' },
                    404: { description: 'Livro não encontrado.' }
                }
            }
        },
        '/api/v1/autores': {
            post: {
                summary: 'Cadastrar novo autor',
                description: 'Rota restrita a administradores (ADMIN) para cadastrar autores.',
                tags: ['Autores (Admin)'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AutorCreate' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Autor cadastrado com sucesso.' },
                    400: { description: 'Nome do autor obrigatório.' },
                    401: { description: 'Token ausente ou inválido.' },
                    403: { description: 'Acesso negado (exclusivo para ADMIN).' }
                }
            }
        },
        '/api/v1/auth/register': {
            post: {
                summary: 'Registrar novo usuário',
                description: 'Cria uma nova conta de usuário com senha hasheada via BCrypt.',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserRegister' }
                        }
                    }
                },
                responses: {
                    201: { description: 'Usuário registrado com sucesso.' },
                    400: { description: 'Campos obrigatórios ausentes.' },
                    409: { description: 'E-mail já cadastrado no sistema.' }
                }
            }
        },
        '/api/v1/auth/login': {
            post: {
                summary: 'Autenticar usuário e gerar token JWT',
                description: 'Valida as credenciais e retorna um token JWT stateless.',
                tags: ['Autenticação'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserLogin' }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login realizado com sucesso, retornando o token.' },
                    400: { description: 'E-mail e senha são obrigatórios.' },
                    401: { description: 'Credenciais inválidas.' }
                }
            }
        }
    }
};

module.exports = swaggerDocument;
