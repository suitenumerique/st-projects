#!/bin/bash

# Install `act` through a package manager to make it working
#
# Notes:
# - there is no way to specify the pipeline branch, you must locally change it
# - you can have weird issues like "unable to get git", try to set your local head to the remote one (with your changes uncommitted)
# - caching:
#   - for now the cache does not work and even if there is https://github.com/sp-ricard-valverde/github-act-cache-server it's a bit overheaded for a ponctual simulation
#   - using "--bind" is not ideal because `npm` will recreate the whole "node_modules" on the host, so we have to do `npm install` then (it would make sense for a computer dedicated to this)
#   - so we use "--reuse" that keeps using the existing docker container if any, to avoid downloading a new time each dependency. If you get weird behavior you can still remove the docker container from `act` and restart the command
# - `.actrc` breaks `act` commands in specific situations, we avoid using it to factorize commands
act push --reuse --env-file .github/act/.env --eventpath .github/act/event.json
