import swaggerAutogen from 'swagger-autogen';

const outputFile = 'src/swagger/swagger_output.json';
const endpointsFiles = ['src/routes/v1/*.ts'];

swaggerAutogen()(outputFile, endpointsFiles);
