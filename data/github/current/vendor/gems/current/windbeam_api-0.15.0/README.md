# Windbeam Ruby API

`windbeam-api-ruby` contains a Ruby API module for clients to communicate with Windbeam's Twirp service (primarily for integrating into the monolith).

## Status
This gem is currently in its early beta stage. Minor changes to the API are expected until we reach v1.0.0. At the moment, we're actively focusing on bug fixes and improving documentation.

## Versioning
This project uses [Semantic Versioning](https://semver.org).

## Releases
The best way to monitor this repository for new releases is to subscribe to releases by using the "Watch" button (Watch->Custom->Releases).

Once we release v1.0.0, we'll publish regular maintenance releases detailing changes in the release post.

## Documentation
Looking to use this SDK to implement your client? Check out [github/windbeam-participant-ruby](https://github.com/github/windbeam-participant-ruby) for information on how to get started!
### Developer Documentation

#### Release Procedure
<details>
  <summary>Steps</summary>

  1. Create a version bump PR branch off of `main` and make a PR going back into `main`. This PR should update the `lib/windbeam_api/version.rb` file according to [Semantic Versioning](https://semver.org/).
  2. After merging your PR, create a tag named `v` followed by the new version number, e.g. `v8.3.2`. This will create a new draft release.
  3. Go to the [releases page](https://github.com/github/windbeam-ruby/releases), find the new draft release, and finalize the publication!
</details>

#### Testing
There is `script/test` available, which runs unit tests ensuring that the library is functioning as expected.

#### Updating `.pb` and `.twirp.pb` files
There is `script/protoc`, which will generate these files for you. The script is known to not currently work in Codespaces, though that will eventually be rectified.
