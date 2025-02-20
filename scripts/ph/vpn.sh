#!/usr/bin/env bash
#
# vpn.sh
#

PROJECT_ROOT=$(cd `dirname "$0"` && git rev-parse --show-toplevel)

cd $PROJECT_ROOT/scripts/ph/

STRONGSWAN_CONF_LOCATION='/etc/swanctl/conf.d/hurado.conf'
PLAINTEXT_FILE_LOCATION='./vpn_credentials.txt'
ENCRYPTED_FILE_LOCATION='./vpn_credentials.txt.gpg'
TEMPORARY_CONF_LOCATION='./hurado.strongswan.conf.tmp'

STRONGSWAN_CONF_TEMPLATE=$(cat << 'EOF'
connections {
    hurado {
        # IKEv1
        version = 1

        # Aggressive Mode
        aggressive = yes

        # Force NAT-T encapsulation
        # encap = yes

        # IKE (Phase 1) proposals: AES256 + SHA512 + DH14, no alternatives
        proposals = aes256-sha512-modp2048

        # We will rekey (IKELifetime) every 24 hours
        rekey_time = 24h

        # Dead peer detection settings
        dpd_delay = 30s
        dpd_timeout = 150s

        # Let the remote server dictate our IP address
        vips=0.0.0.0,::

        # Local side (client)
        # local_addrs  = %defaultroute

        # Use Two-Phase IKEv1 Hybrid Authentication

        # Phase 1: Pre-shared Key
        local {
            auth = psk
            id = "${HURADO_VPN_USERNAME}"
        }

        # Phase 2: Xauth / Username + Password
        local-2 {
            auth = xauth
            id = "${HURADO_VPN_USERNAME}"
        }

        # Remote side (VPN Server)
        remote_addrs = ${HURADO_VPN_GATEWAY}
        remote {
            auth = psk
            id = "${HURADO_VPN_GATEWAY_ID}"
        }

        children {
            main {
                esp_proposals = aes256-sha512-modp2048

                # Rekey (Child SA lifetime) every 12 hours
                rekey_time = 12h

                # Restart on dead peer
                dpd_action = start

                # Remote addresses we want to reach through this VPN
                remote_ts = 10.10.255.0/24

                # local_ts  = 0.0.0.0/0
            }
        }
    }
}

secrets {
    # Pre-Shared Key for Phase 1
    ike-hurado-psk {
        id = "${HURADO_VPN_GATEWAY}"
        id-local = "${HURADO_VPN_USERNAME}"
        secret = "${HURADO_VPN_PRESHARED_KEY}"
    }

    # Xauth Credentials for Phase 2
    xauth-hurado-local-2 {
        id = "${HURADO_VPN_USERNAME}"
        secret = "${HURADO_VPN_TIMED_PASSWORD}"
    }
}
EOF
)


function vpn_encrypt() {
    # Encrypt the plaintext file for permanent storage
    gpg --symmetric --cipher-algo AES256 -o $ENCRYPTED_FILE_LOCATION $PLAINTEXT_FILE_LOCATION
}


function vpn_decrypt() {
    # Decrypt the ciphertext file for editing or to change the password
    gpg --decrypt -o $PLAINTEXT_FILE_LOCATION $ENCRYPTED_FILE_LOCATION
}


function vpn_up() {
    if ! [ -f $PLAINTEXT_FILE_LOCATION ] && ! [ -f $ENCRYPTED_FILE_LOCATION ]; then
      echo "Error: Neither '${PLAINTEXT_FILE_LOCATION}' nor '${ENCRYPTED_FILE_LOCATION}' found. Please get a plaintext copy from someone and optionally encrypt it."
      exit 1
    fi

    if ! sudo -S true; then
        echo "Error: Incorrect sudo password."
        exit 1
    fi

    read -p "Enter FortiToken OTP: " FORTITOKEN_OTP

    # Load the credentials (plaintext or encrypted) into the environment. Prefer plaintext if available.
    set -o allexport
    if [ -f $PLAINTEXT_FILE_LOCATION ]; then
      source $PLAINTEXT_FILE_LOCATION
    else
      eval $(gpg --decrypt -o - $ENCRYPTED_FILE_LOCATION)
    fi
    set +o allexport

    # Fortigate does this crazy thing of appending the OTP to the password. ChatGPT told me about it!
    # I sure as hell hope they split the OTP off then use a secure hash function on the first half lol
    export HURADO_VPN_TIMED_PASSWORD="${HURADO_VPN_PASSWORD}${FORTITOKEN_OTP}"

    echo "$STRONGSWAN_CONF_TEMPLATE" | envsubst > $TEMPORARY_CONF_LOCATION
    sudo mv $TEMPORARY_CONF_LOCATION $STRONGSWAN_CONF_LOCATION
    echo "StrongSwan configuration file replaced at '${STRONGSWAN_CONF_LOCATION}'"

    sudo swanctl --load-all
    sudo swanctl --initiate --ike hurado --child main
}


function vpn_down() {
    sudo swanctl --terminate --ike hurado
    sudo rm $STRONGSWAN_CONF_LOCATION
    sudo swanctl --load-all
}


function vpn_main() {
    case "$1" in
        encrypt)
            shift
            vpn_encrypt $@
            ;;
        decrypt)
            shift
            vpn_decrypt $@
            ;;
        up)
            shift
            vpn_up $@
            ;;
        down)
            shift
            vpn_down $@
            ;;
        *)
            echo "Usage: sudo vpn {encrypt|decrypt|up|down}"
            echo "Subcommands:"
            echo "  encrypt: Encrypts vpn_credentials.txt"
            echo "  decrypt: Decrypts vpn_credentials.txt.gpg"
            echo "  up: Generates a configuration file from the credentials and uses it to connect to the VPN"
            echo "  down: Stops the VPN connection and removes the configuration"
            return 1
            ;;
    esac
}

vpn_main $@
