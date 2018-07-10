const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Recipes', function() {
    before(function() {
        return runServer();
    });
    after(function() {
        return closeServer();
    });
    it('should list recipes on GET', function() {
        return chai.request(app)
        .get('/recipes')
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');
            expect(res.body.length).to.be.above(0);
            res.body.forEach(function(item) {
                expect(item).to.be.a('object');
                expect(item).to.have.all.keys('id', 'name', 'ingredients');
            });
        });
    });
    it('should add a recipe on POST', function() {
        const newRecipe = {name: 'oatmeal craisin cookies', ingredients: ['cookie mix', 'egg', 'craisins']};
        return chai.request(app)
            .post('/recipes') // ask about where this should come from
            .send(newRecipe)
            .then(function(res) {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.include.keys('id', 'name', 'ingredients');
                expect(res.body.id).to.not.equal(null);
                expect(res.body).to.deep.equal(Object.assign(newRecipe, {id: res.body.id}));
            });
    });
    it('should update recipes on PUT', function() {
        const updateRecipe = {
            name: 'non-Asian white rice',
            ingredients: ['1 cup white rice', '2 cups water', 'pinch of salt']
        };
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                updateRecipe.id = res.body[0].id;
                return chai.request(app)
                    .put(`/recipes/${updateRecipe.id}`)
                    .send(updateRecipe)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
                // why are the below three lines not needed, it was in it for example
                // expect(res).to.be.json;
                // expect(res.body).to.be.a('object');
                // expect(res.body).to.deep.equal(updateRecipe);
            });
    });
    it('should delete recipes on DELETE', function() {
        return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                return chai.request(app)
                    .delete(`/recipes/${res.body[0].id}`)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            });
    });
});

