# Database Schema Design

This document outlines the database schema for our Facebook-like social networking platform. We'll be using a combination of SQL database (PostgreSQL) for structured data and relationships, and potentially NoSQL solutions (like MongoDB) for specific features requiring high scalability.

## Entity Relationship Overview

![Entity Relationship Diagram would go here]

## Core Tables

### Users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | VARCHAR(50) | Unique username |
| email | VARCHAR(255) | Unique email address |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(50) | User's first name |
| last_name | VARCHAR(50) | User's last name |
| bio | TEXT | User's biography |
| profile_image_url | VARCHAR(255) | Profile picture URL |
| cover_image_url | VARCHAR(255) | Cover photo URL |
| date_of_birth | DATE | User's birth date |
| location | VARCHAR(100) | User's location |
| website | VARCHAR(255) | User's website |
| phone_number | VARCHAR(20) | User's phone number |
| is_verified | BOOLEAN | Account verification status |
| is_private | BOOLEAN | Account privacy setting |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |
| last_login | TIMESTAMP | Last login time |

Indexes:
- Primary Key: id
- Unique Index: username, email
- Index: last_login, created_at

### Profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| work | JSONB | Work history |
| education | JSONB | Education history |
| relationship_status | VARCHAR(50) | Relationship status |
| interests | JSONB | User interests |
| about | TEXT | Extended about information |
| updated_at | TIMESTAMP | Last update time |

Indexes:
- Primary Key: id
- Foreign Key: user_id

### Posts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| content | TEXT | Post text content |
| media_urls | JSONB | Array of media URLs |
| privacy_level | VARCHAR(20) | Public, Friends, Private, etc. |
| location | VARCHAR(100) | Post location |
| feeling | VARCHAR(50) | Feeling/activity |
| is_edited | BOOLEAN | Whether post has been edited |
| created_at | TIMESTAMP | Post creation time |
| updated_at | TIMESTAMP | Last edit time |

Indexes:
- Primary Key: id
- Foreign Key: user_id
- Index: created_at

### Comments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| post_id | UUID | Foreign key to Posts |
| user_id | UUID | Foreign key to Users |
| parent_comment_id | UUID | For nested comments (nullable) |
| content | TEXT | Comment content |
| media_url | VARCHAR(255) | Optional media URL |
| created_at | TIMESTAMP | Comment creation time |
| updated_at | TIMESTAMP | Last edit time |

Indexes:
- Primary Key: id
- Foreign Keys: post_id, user_id, parent_comment_id
- Index: created_at

### Likes
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| likeable_type | VARCHAR(50) | Post, Comment, etc. |
| likeable_id | UUID | ID of the liked object |
| reaction_type | VARCHAR(20) | Like, Love, Laugh, etc. |
| created_at | TIMESTAMP | Like creation time |

Indexes:
- Primary Key: id
- Composite Index: (user_id, likeable_type, likeable_id)

### Friendships
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Requester user ID |
| friend_id | UUID | Recipient user ID |
| status | VARCHAR(20) | pending, accepted, rejected, blocked |
| created_at | TIMESTAMP | Request time |
| updated_at | TIMESTAMP | Status update time |

Indexes:
- Primary Key: id
- Composite Index: (user_id, friend_id)
- Index: status

### Messages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | UUID | Foreign key to Conversations |
| sender_id | UUID | Foreign key to Users |
| content | TEXT | Message content |
| media_urls | JSONB | Array of media URLs |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Message time |
| read_at | TIMESTAMP | Time message was read |

Indexes:
- Primary Key: id
- Foreign Keys: conversation_id, sender_id
- Index: created_at

### Conversations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | For group conversations |
| is_group | BOOLEAN | Group or direct message |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

Indexes:
- Primary Key: id

### ConversationParticipants
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | UUID | Foreign key to Conversations |
| user_id | UUID | Foreign key to Users |
| joined_at | TIMESTAMP | Join time |
| left_at | TIMESTAMP | Leave time (nullable) |
| is_admin | BOOLEAN | Admin status for groups |

Indexes:
- Primary Key: id
- Composite Index: (conversation_id, user_id)

### Groups
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Group name |
| description | TEXT | Group description |
| cover_image_url | VARCHAR(255) | Group cover image |
| privacy_level | VARCHAR(20) | Public, Private, Secret |
| creator_id | UUID | Foreign key to Users |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update time |

Indexes:
- Primary Key: id
- Foreign Key: creator_id
- Index: name, privacy_level

### GroupMembers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | Foreign key to Groups |
| user_id | UUID | Foreign key to Users |
| role | VARCHAR(20) | admin, moderator, member |
| joined_at | TIMESTAMP | Join time |

Indexes:
- Primary Key: id
- Composite Index: (group_id, user_id)

### Notifications
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users |
| type | VARCHAR(50) | Notification type |
| entity_type | VARCHAR(50) | Related entity type |
| entity_id | UUID | Related entity ID |
| actor_id | UUID | User who triggered notification |
| is_read | BOOLEAN | Read status |
| data | JSONB | Additional data |
| created_at | TIMESTAMP | Creation time |
| read_at | TIMESTAMP | Time notification was read |

Indexes:
- Primary Key: id
- Foreign Key: user_id, actor_id
- Index: created_at, is_read

## Additional Considerations

### Scaling Strategies
- Partitioning posts table by date
- Read replicas for high-traffic queries
- Cache layer for frequently accessed data (Redis)
- Consider time-series data approach for feeds

### Data Archiving
- Archive old posts and interactions
- Consider cold storage for media content

### Performance Optimizations
- Denormalize data for feed generation
- Materialized views for complex aggregations
- Consider a separate search database (Elasticsearch)

### Media Storage
- Use cloud storage (AWS S3, Google Cloud Storage)
- CDN for media delivery
- Image optimization pipeline

### Real-time Features
- Consider a separate database for real-time features
- Use a message queue for asynchronous tasks 