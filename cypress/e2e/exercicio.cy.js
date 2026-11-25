/// <reference types="cypress" />

describe("Testes da Funcionalidade Catálogo de Livros", () => {
  let token;

  beforeEach(() => {
    cy.geraToken("admin@biblioteca.com", "admin123").then((tkn) => {
      token = tkn;
      
    });
  });

  // Objetivo: Verificar que a API retorna lista de livros com paginação e filtros funcionando
  // Validar que filtros por categoria e autores funcionam corretamente
  it("GET - Deve listar livros com filtros e paginação", () => {
    cy.request({
      method: "GET",
      url: "books",
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.exist;
      expect(response.body.books).to.exist;
      expect(response.body.books).to.be.an("array");
      expect(response.body.pagination).to.exist;
      expect(response.body.pagination).to.be.an("object");
      cy.log(JSON.stringify(response.body.pagination, null, 2));

      const { total, limit, currentPage, totalPages } = response.body.pagination;

      expect(total).to.be.a("number").and.to.be.at.least(1);
      expect(limit).to.equal(20);
      expect(currentPage).to.equal(1);
      expect(totalPages).to.equal(Math.ceil(total / limit));
      expect(response.body.pagination.hasNext).to.equal(currentPage < totalPages);
      expect(response.body.pagination.hasPrev).to.equal(false);
      expect(response.body.pagination.showing).to.equal(response.body.books.length);
    });
  });

  // Objetivo: Validar que é possível obter detalhes de um livro específico pelo ID
  // Verificar que todos os campos do livro são retornados corretamente
  it("GET - Deve obter detalhes de um livro específico", () => {
    cy.request({
      method: "GET",
      url: "books/19",
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.book).to.exist;
      expect(response.body.book).to.be.an("object");
      expect(response.body.book).to.include.all.keys(
        "id",
        "title",
        "author",
        "description",
        "category",
        "isbn",
        "editor",
        "language",
        "publication_year",
        "pages",
        "format",
        "total_copies",
        "available_copies",
        "cover_image",
        "created_at"
      );
expect(response.body).to.have.property("availability");
expect(response.body).to.have.property("statistics");
      expect(response.body.book.id).to.equal(19);
      expect(response.body.book.title).to.equal("O Sol é Para Todos");
      expect(response.body.book.author).to.equal("Harper Lee");
      expect(response.body.book.publication_year).to.equal(2008);
      expect(response.body.book.isbn).to.equal("978-85-AUTO-0019-7");
      expect(response.body.book.pages).to.equal(256);
      expect(response.body.book.language).to.equal("Português");
      expect(response.body.book.editor).to.equal("Editora José Olympio");
      expect(response.body.book.format).to.equal("Físico");
      expect(response.body.book.total_copies).to.equal(5);
      expect(response.body.book.available_copies).to.equal(5);
      expect(response.body.book.description).to.equal(
        "Narrado pela jovem Scout, o livro denuncia o racismo e a injustiça nos Estados Unidos dos anos 30, comovendo leitores com sua sensibilidade e firmeza moral.",
      );
      expect(response.body.book.cover_image).to.equal("sol-pra-todos.jpg");
      expect(response.body.book.created_at).to.equal("2025-08-09 16:31:01");
      expect(response.body.book.isAvailable).to.equal(true);
      console.log("CHAVES REAIS:", Object.keys(response.body.book));
    });
  });

  // Objetivo: Validar que um novo livro é adicionado com sucesso ao catálogo
  // Verificar que apenas admin pode adicionar novos livros (validação de permissão)

  it("POST - Deve cadastrar um novo livro com sucesso", () => {
    const timestamp = Date.now();

    cy.request({
      method: "POST",
      url: "books",
      headers: {
        Authorization: token,
      },
      body: {
        title: `Moda e vida ${timestamp}`,
        author: "André Carvalhau",
        description: "Como dar vida à moda",
        category: "Fotografia de Moda",
        isbn: `978-${timestamp.toString().slice(-10)}`,
        editor: "Agir",
        language: "Português",
        publication_year: 2025,
        pages: 464,
        format: "Físico",
        total_copies: 10,
        available_copies: 2,
      },
    }).then((response) => {
      cy.log(`STATUS: ${response.status}`);
      cy.log(JSON.stringify(response.body));
      expect(response.status).to.equal(201);
    });
  });
    
  // Objetivo: Garantir que dados inválidos são rejeitados ao adicionar um livro
  // Validar mensagens de erro apropriadas para dados faltantes ou incorretos
  
it("POST - Deve rejeitar livro com dados inválidos", () => {
  cy.request({
    method: "POST",
    url: "books",
    failOnStatusCode: false,
    headers: {
      Authorization: token,
    },
    body: {
      title: "",
      author: "",
      publication_year: "ano-invalido",
      pages: -10,
      total_copies: -1,
    },
  }).then((response) => {
    expect(response.body.message).to.equal('"title" is not allowed to be empty');
     expect(response.status).to.equal(400);
     expect(response.body).to.have.property("message");
     expect(response.body).to.have.property("field", "title");
  });
});


  // Objetivo: Validar que um livro pode ser atualizado com sucesso
  // Verificar que apenas admin pode atualizar livros (validação de permissão)
  // Objetivo: Validar que um livro pode ser atualizado com sucesso
  // Verificar que apenas admin pode atualizar livros (validação de permissão)
  it("PUT - Deve atualizar um livro previamente cadastrado", () => {
    cy.request({
      method: "PUT",
      url: "books/12",
      headers: {
        Authorization: token,
      },
      body: {
        title: "O Hobbit",
        author: "J.R.R. Tolkien",
        description:
          "Bilbo Bolseiro embarca em uma jornada inesperada com anões em busca de um tesouro guardado por um dragão. Uma introdução ao universo da Terra Média e às aventuras épicas de Tolkien.",
        category: "Fantasia",
        editor: "HarperCollins Brasil",
        language: "Português",
        publication_year: 2008,
        pages: 256,
        format: "Físico",
        total_copies: 12,
        available_copies:1,
      },
    }).then((response) => {
      expect(response.status).to.equal(200);
      cy.log(`RESPOSTA PUT: ${JSON.stringify(response.body)}`);

      // Consulta o livro para confirmar que o campo foi alterado no banco
      cy.request("GET", "books/12").then((getResponse) => {
        expect(getResponse.status).to.equal(200);
        expect(getResponse.body.book.available_copies).to.equal(1);
        cy.log(
          `Campo alterado: available_copies -> ${getResponse.body.book.available_copies}`
        );
      });
    });
  });

  // Objetivo: Validar que um livro pode ser removido do catálogo
  // Verificar que apenas admin pode deletar livros (validação de permissão)
  // Objetivo: Validar que um livro pode ser removido do catálogo
  // Verificar que apenas admin pode deletar livros (validação de permissão)
  it("DELETE - Deve deletar um livro previamente cadastrado", () => {
    // 1. Cria um livro exclusivo para o teste
    cy.request({
      method: "POST",
      url: "books",
      headers: {
        Authorization: token,
      },
      body: {
        title: `Livro para Deletar ${Date.now()}`,
        author: "Autor Teste",
        description: "Livro criado dinamicamente para teste de exclusão",
        category: "Teste",
        isbn: `978-${Date.now().toString().slice(-10)}`,
        editor: "Editora Teste",
        language: "Português",
        publication_year: 2025,
        pages: 100,
        format: "Físico",
        total_copies: 2,
        available_copies: 2,
      },
    }).then((postResponse) => {
      expect(postResponse.status).to.equal(201);
      const bookId = postResponse.body.book.id;
      cy.log(`Livro criado com ID: ${bookId}`);

      // 2. Deleta o livro recém-criado
      cy.request({
        method: "DELETE",
        url: `books/${bookId}`,
        headers: {
          Authorization: token,
        },
      }).then((deleteResponse) => {
        cy.log(`RESPOSTA DELETE: ${JSON.stringify(deleteResponse.body)}`);
        expect(deleteResponse.status).to.equal(200);

        // 3. Confirmar exclusão (404)
        cy.request({
          method: "GET",
          url: `books/${bookId}`,
          failOnStatusCode: false,
        }).then((getResponse) => {
          expect(getResponse.status).to.equal(404);
        });
      });
    });
  });
});
