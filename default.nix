with import <nixpkgs> {};
stdenv.mkDerivation rec {
  name = "fgq19";
  env = buildEnv { name = name; paths = buildInputs; };
  buildInputs = [
    nodejs-10_x
    yarn
  ];
}
