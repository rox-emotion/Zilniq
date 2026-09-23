
const { withPodfile } = require("@expo/config-plugins");

// Xcode 16+/26 Apple Clang has a consteval bug that breaks compiling any
// FMT_STRING(...) call inside fmt/format-inl.h's own translation unit
// (used purely for compile-time format-string checking). Those checks
// aren't needed for fmt's own internal literals, so we strip the
// FMT_STRING() wrapper throughout this file, matching the fix fmt shipped
// upstream for formatter<detail::bigint> and applying it file-wide since
// the bug isn't limited to that one call site.
const fmtFix = `
  # Xcode 26 fmt consteval workaround (see fmtlib/fmt issues re: Apple Clang consteval bug)
  format_inl = File.join(installer.sandbox.root.to_s, 'fmt', 'include', 'fmt', 'format-inl.h')
  if File.exist?(format_inl)
    contents = File.read(format_inl)
    patched = contents.gsub(/FMT_STRING\\((".*?")\\)/, '\\\\1')
    File.write(format_inl, patched) if patched != contents
  end
`;

module.exports = function withIosFmtFix(config) {
    return withPodfile(config, (config) => {
        const podfile = config.modResults.contents;

        if (podfile.includes("Xcode 26 fmt consteval workaround")) {
            return config;
        }

        const anchor = /post_install do \|installer\|/;
        if (!anchor.test(podfile)) {
            throw new Error("Could not find post_install in Podfile");
        }

        config.modResults.contents = podfile.replace(
            anchor,
            (match) => `${match}\n${fmtFix}`
        );

        return config;
    });
};
