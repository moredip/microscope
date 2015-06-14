resource "aws_elb" "admin-elb" {
  name = "admin-elb"

  listener {
    instance_port = 80
    instance_protocol = "http"
    lb_port = 80
    lb_protocol = "http"
  }
  availability_zones = ["${aws_instance.elasticsearch-frontend.availability_zone}"]
  # The instance is registered automatically
  instances = ["${aws_instance.elasticsearch-frontend.id}"]
}

resource "aws_security_group" "allow_http" {
  name = "allow_http"
  description = "Allow http"

  ingress {
      from_port = 80
      to_port = 80
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "allow_ssh" {
  name = "allow_ssh"
  description = "Allow SSH"

  ingress {
      from_port = 22
      to_port = 22
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "internal_es_traffic" {
  name = "internal_es_traffic"
  description = "Allow ES nodes to talk to each other"

  ingress {
      from_port = 9200
      to_port = 9200
      protocol = "tcp"
      self = true
  }
  ingress {
      from_port = 9300
      to_port = 9300
      protocol = "tcp"
      self = true
  }
}

resource "aws_instance" "elasticsearch-node" {
    ami = "ami-98aa1cf0"
    instance_type = "t1.micro"
		key_name = "microscope"
    tags { 
				Role = "elasticsearch-node"
    }
    count = 2

    security_groups = ["${aws_security_group.allow_ssh.name}","${aws_security_group.internal_es_traffic.name}"]
}

resource "aws_instance" "elasticsearch-frontend" {
    ami = "ami-98aa1cf0"
    instance_type = "t1.micro"
		key_name = "microscope"
    tags { 
				Role = "elasticsearch-frontend"
    }
    count = 1

    security_groups = ["${aws_security_group.allow_http.name}","${aws_security_group.allow_ssh.name}","${aws_security_group.internal_es_traffic.name}"]
}
