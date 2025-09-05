from setuptools import setup, find_packages

setup(
    name="rockfall-prediction",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "python-jose[cryptography]",
        "passlib[bcrypt]",
        "python-dotenv",
        "requests",
        "schedule",
        "python-multipart",
        "email-validator",
        "numpy",
        "pandas",
        "alembic",
        "python-jose",
        "pyjwt",
    ],
)
