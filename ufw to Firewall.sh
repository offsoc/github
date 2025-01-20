#!/bin/bash

# 设置输入和输出目录
input_dir="applications.d"
output_dir="out"

# 检查输入目录是否存在
if [ ! -d "$input_dir" ]; then
  echo "Input directory $input_dir not found!"
  exit 1
fi

# 确保输出目录存在（您可能需要使用sudo创建）
sudo mkdir -p "$output_dir"

# 遍历输入目录中的文件
for file in "$input_dir"/*; do
  # 提取文件名（不包括路径）
  filename=$(basename "$file")
  
  # 开始处理文件内容
  service_name=""
  short_desc=""
  long_desc=""
  port_line=""

  while IFS= read -r line; do
    if [[ $line =~ ^\[([a-zA-Z0-9-]+)\]$ ]]; then
      # 提取服务名称
      service_name="${BASH_REMATCH[1]}"

    elif [[ $line =~ ^title=(.*)$ ]]; then
      # 提取 short title
      short_desc="${BASH_REMATCH[1]}"

    elif [[ $line =~ ^description=(.*)$ ]]; then
      # 提取 description
      long_desc="${BASH_REMATCH[1]}"

    elif [[ $line =~ ^ports=([0-9:-]+)/([a-z]+)$ ]]; then
      # 提取端口和协议
      ports="${BASH_REMATCH[1]}"
      protocol="${BASH_REMATCH[2]}"
      port_line="    <port protocol=\"$protocol\" port=\"${ports//:/-}\"/>"
    fi
  done < "$file"

  # 创建目标 XML 文件路径
  xml_file="$output_dir/${filename}.xml"

  # 写入内容到 XML 文件
  {
    echo '<?xml version="1.0" encoding="utf-8"?>'
    echo '<service>'
    echo "    <short>$short_desc</short>"
    echo "    <description>$long_desc</description>"
    echo "$port_line"
    echo '</service>'
  } |  tee "$xml_file" > /dev/null

  echo "Converted $file to $xml_file."
done