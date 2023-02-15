clean:
	@find . -name 'build' ! -path '*/node_modules/*' -exec rm -fr {} +
	@find . -name 'bin' ! -path '*/node_modules/*' -exec rm -fr {} +
	@find . -name 'obj' ! -path '*/node_modules/*' -exec rm -fr {} +
	@find . -name 'dist' ! -path '*/node_modules/*' -exec rm -fr {} +
	@find . -name 'publish' ! -path '*/node_modules/*' -exec rm -fr {} +

check-vulnerabilities: clean
	@cd ./ui && npm audit --omit=dev

run-web: clean
	@cd ./ui && npm start

run-api: clean
	@cd ./api && dotnet run

dist-api: clean
	@cd ./api && dotnet publish -c Release -f net6.0 -o build

test-api: clean
	@cd ./api-tests && dotnet test api-tests.csproj

lint-ui: clean
	@cd ./ui && npm run lint
	@cd ./ui && npm run format

test-ui: clean
	@cd ./ui && npm run test

dist-ui: clean
	@cd ./ui && npm run build
