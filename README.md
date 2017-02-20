# applique

I wanted a cross-platform, open-source, command-line IPS patching tool written in a non-compiled language. So I'm writing one.

Use at your own risk. It's worked for me in all the cases I've tried it for, including a couple that test some edge-case behavior of IPS format, and it's been fine so far. But I can't promise it will work correctly for you.

## Usage

node index.js -f {input_filename} -p {patch_filename} -o {output_filename}