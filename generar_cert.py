import datetime
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def generate_self_signed_cert():
    print("🔐 Generando clave privada RSA 2048 bits...")
    key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )

    print("📜 Generando certificado auto-firmado para 'localhost'...")
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, u"US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, u"California"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, u"San Francisco"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"NEXA Robotics"),
        x509.NameAttribute(NameOID.COMMON_NAME, u"localhost"),
    ])

    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.datetime.utcnow()
    ).not_valid_after(
        # Válido por 1 año
        datetime.datetime.utcnow() + datetime.timedelta(days=365)
    ).add_extension(
        x509.SubjectAlternativeName([x509.DNSName(u"localhost")]),
        critical=False,
    ).sign(key, hashes.SHA256())

    # Guardar clave privada
    print("💾 Guardando key.pem...")
    with open("key.pem", "wb") as f:
        f.write(key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.NoEncryption(),
        ))

    # Guardar certificado
    print("💾 Guardando cert.pem...")
    with open("cert.pem", "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

    print("\n✅ ¡LISTO! Certificados generados exitosamente.")
    print("   Ahora ejecuta 'python NEXA_OS/server.py' para usar HTTPS.")

if __name__ == "__main__":
    try:
        generate_self_signed_cert()
    except ImportError:
        print("❌ Error: Falta la librería 'cryptography'.")
        print("   Ejecuta: pip install cryptography")
    except Exception as e:
        print(f"❌ Error: {e}")
