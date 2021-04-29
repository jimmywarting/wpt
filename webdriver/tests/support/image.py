from base64 import decodebytes
import math
import struct

from tests.support.asserts import assert_png


def png_dimensions(screenshot: str):
    assert_png(screenshot)
    image = decodebytes(screenshot.encode())
    width, height = struct.unpack(">LL", image[16:24])
    return int(width), int(height)
