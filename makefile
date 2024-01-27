build-and-run: # Build and run the application
	docker compose up --build frontend backend -d
e2e-tests: # Run end-to-end tests of the built docker images
	./e2e_tests.sh
local-install: # Install dependencies for local development
	cd frontend && yarn install
	cd backend && yarn install
	cd e2e && yarn install
backend-dev:
	cd backend && make dev-with-db
frontend-dev:
	cd frontend && yarn dev
e2e-dev: # Run `make backend-dev` in separate terminal first.
	cd e2e && yarn cypress open &
	make frontend-dev
