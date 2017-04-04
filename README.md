# applique

I wanted a ROM patching tool that was cross-platform, open-source, and functioned through CLI, GUI, and browsers, all using the same codebase. So I'm writing one. My longer term plan is to add support for applying more patch types, add support for generating various patch types, releasing the code under a dual license, and making a single-serving website that allows users to do this on their own machine with zero footprint.

"Support" is a strong word. But applique can currently do the following things:

IPS patches:
* apply

UPS patches:
* apply
* enforce file integrity checks (optional)

BPS, xdelta, and other patch types are not yet implemented at all.
Patches cannot yet be generated.
Only a command-line interface is available.

Use at your own risk.

## Usage

node index.js -f {input_filename} -p {patch_filename} -o {output_filename}
