"""empty message

Revision ID: 5022b6a07f92
Revises: f8e13875ddb5
Create Date: 2025-01-30 18:06:39.281155

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision = '5022b6a07f92'
down_revision = 'f8e13875ddb5'
branch_labels = None
depends_on = None


def upgrade():
    # Check if the new_password column already exists
    conn = op.get_bind()
    result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='user' AND column_name='new_password'"))
    columns = [row[0] for row in result.fetchall()]
    
    if 'new_password' not in columns:
        # Create a new column with the desired type, setting it as NOT NULL
        op.add_column('user', sa.Column('new_password', sa.String(length=512), nullable=False))
    
    # Copy data from the old column to the new column
    op.execute('UPDATE "user" SET new_password = password')
    
    # Drop the old column
    op.drop_column('user', 'password')
    
    # Rename the new column to the original column name
    op.alter_column('user', 'new_password', new_column_name='password')

def downgrade():
    # Create a new column to revert the changes
    op.add_column('user', sa.Column('old_password', sa.VARCHAR(length=200), nullable=True))
    
    # Copy data from the current column to the old column
    op.execute('UPDATE "user" SET old_password = password')
    
    # Drop the current column
    op.drop_column('user', 'password')
    
    # Rename the old column back to the original name
    op.alter_column('user', 'old_password', new_column_name='password')
