FROM amazonlinux:latest

# set up container
RUN yum -y update \
  && yum -y groupinstall "Development Tools" \
  && curl --silent --location https://rpm.nodesource.com/setup_16.x | bash - \
  && yum install -y nodejs gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel librsvg2-devel pango-devel bzip2-devel

# will be created and become working dir
WORKDIR /root/layer/nodejs

RUN npm install --no-save canvas

# will be created and become working dir
WORKDIR /root/layer/lib

# gather missing libraries
RUN cp /usr/lib64/libEGL.so.1 . \
  && cp /usr/lib64/libGL.so.1 . \
  && cp /usr/lib64/libGLX.so.0 . \
  && cp /usr/lib64/libGLdispatch.so.0 . \
  && cp /usr/lib64/libICE.so.6 . \
  && cp /usr/lib64/libSM.so.6 . \
  && cp /usr/lib64/libX11.so.6 . \
  && cp /usr/lib64/libXau.so.6 . \
  && cp /usr/lib64/libXext.so.6 . \
  && cp /usr/lib64/libXrender.so.1 . \
  && cp /usr/lib64/libblkid.so.1 . \
  && cp /usr/lib64/libbz2.so.1 . \
  && cp /usr/lib64/libc.so.6 . \
  && cp /usr/lib64/libcairo.so.2 . \
  && cp /usr/lib64/libcroco-0.6.so.3 . \
  && cp /usr/lib64/libdl.so.2 . \
  && cp /usr/lib64/libexpat.so.1 . \
  && cp /usr/lib64/libffi.so.6 . \
  && cp /usr/lib64/libfontconfig.so.1 . \
  && cp /usr/lib64/libfreetype.so.6 . \
  && cp /usr/lib64/libfribidi.so.0 . \
  && cp /usr/lib64/libgcc_s.so.1 . \
  && cp /usr/lib64/libgdk_pixbuf-2.0.so.0 . \
  && cp /usr/lib64/libgif.so.4 . \
  && cp /usr/lib64/libgio-2.0.so.0 . \
  && cp /usr/lib64/libglib-2.0.so.0 . \
  && cp /usr/lib64/libgmodule-2.0.so.0 . \
  && cp /usr/lib64/libgobject-2.0.so.0 . \
  && cp /usr/lib64/libgraphite2.so.3 . \
  && cp /usr/lib64/libharfbuzz.so.0 . \
  && cp /usr/lib64/libjpeg.so.62 . \
  && cp /usr/lib64/liblzma.so.5 . \
  && cp /usr/lib64/libm.so.6 . \
  && cp /usr/lib64/libmount.so.1 . \
  && cp /usr/lib64/libpango-1.0.so.0 . \
  && cp /usr/lib64/libpangocairo-1.0.so.0 . \
  && cp /usr/lib64/libpangoft2-1.0.so.0 . \
  && cp /usr/lib64/libpcre.so.1 . \
  && cp /usr/lib64/libpixman-1.so.0 . \
  && cp /usr/lib64/libpng15.so.15 . \
  && cp /usr/lib64/libpthread.so.0 . \
  && cp /usr/lib64/libresolv.so.2 . \
  && cp /usr/lib64/librsvg-2.so.2 . \
  && cp /usr/lib64/librt.so.1 . \
  && cp /usr/lib64/libselinux.so.1 . \
  && cp /usr/lib64/libstdc++.so.6 . \
  && cp /usr/lib64/libthai.so.0 . \
  && cp /usr/lib64/libuuid.so.1 . \
  && cp /usr/lib64/libxcb-render.so.0 . \
  && cp /usr/lib64/libxcb-shm.so.0 . \
  && cp /usr/lib64/libxcb.so.1 . \
  && cp /usr/lib64/libxml2.so.2 . \
  && cp /usr/lib64/libz.so.1 .

RUN mkdir -p /out

ENTRYPOINT ["mv", "-T", "/root/layer", "/out/build"]
