# applique

I wanted a cross-platform, open-source, command-line IPS patching tool written in a non-compiled language. So I'm writing one. My longer term plan is to add support for applying more patch types, add support for generating various patch types, releasing the code under a dual license, and making a single-serving website that allows users to do this on their own machine with zero footprint.

Use at your own risk. It's worked for me in all the cases I've tried it for, including a couple that test some edge-case behavior of IPS format, and it's been fine so far. But I can't promise it will work correctly for you.

## Usage

node index.js -f {input_filename} -p {patch_filename} -o {output_filename}
