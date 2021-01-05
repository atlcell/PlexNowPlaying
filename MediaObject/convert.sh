ffmpeg -loop 1 -i CoverTest2.jpg -i Pardon.mp3 -ss 00:00:00 -to 00:00:30 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest take1.mp4


# ID3 Tag/Embedded Artwork
ffmpeg -i in.mp3 -filter_complex "color[c];[c][0]scale2ref[c][art];[c][art]overlay" -shortest out.mp4

